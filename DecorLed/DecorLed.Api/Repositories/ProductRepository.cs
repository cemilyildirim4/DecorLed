using Dapper;
using DecorLed.Api.Models;
using Npgsql;
using System.Data;

namespace DecorLed.Api.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly string _connectionString;

        public ProductRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Veritabanı bağlantı cümlesi bulunamadı!");

            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {

            var sql = @"
                SELECT p.*, pa.* FROM products p
                LEFT JOIN productattributes pa ON p.id = pa.productid
            ";

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                var productDictionary = new Dictionary<int, Product>();

                var result = await db.QueryAsync<Product, ProductAttribute, Product>(
                    sql,
                    (product, attribute) =>
                    {
                        if (!productDictionary.TryGetValue(product.Id, out var currentProduct))
                        {
                            currentProduct = product;
                            productDictionary.Add(currentProduct.Id, currentProduct);
                        }

                        if (attribute != null)
                        {
                            currentProduct.Attributes.Add(attribute);
                        }

                        return currentProduct;
                    },
                    splitOn: "id" 
                );
                return productDictionary.Values;
            }
        }

        public async Task<Product> AddProductAsync(Product product)
        {

            var insertProductSql = @"
                INSERT INTO products (productname, description, price, stockquantity, categoryid, image_url)
                VALUES (@ProductName, @Description, @Price, @StockQuantity, @CategoryId, @ImageUrl)
                RETURNING id;";

            var insertAttributeSql = @"
                INSERT INTO productattributes (productid, attributename, attributevalue)
                VALUES (@ProductId, @AttributeName, @AttributeValue);";

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                db.Open();
                using (var transaction = db.BeginTransaction())
                {
                    try
                    {
                        var productId = await db.QuerySingleAsync<int>(insertProductSql, product, transaction);
                        product.Id = productId;

                        if (product.Attributes != null && product.Attributes.Any())
                        {
                            foreach (var attribute in product.Attributes)
                            {
                                attribute.ProductId = productId;
                            }

                            await db.ExecuteAsync(insertAttributeSql, product.Attributes, transaction);
                        }

                        transaction.Commit();
                        return product;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new Exception($"Ürün veri tabanına kaydedilirken hata oluştu: {ex.Message}");
                    }
                }
            }
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            // Önce ürüne bağlı dinamik özellikleri, sonra ürünün kendisini siliyoruz
            var deleteAttributesSql = "DELETE FROM productattributes WHERE productid = @Id;";
            var deleteProductSql = "DELETE FROM products WHERE id = @Id;";

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                db.Open();
                using (var transaction = db.BeginTransaction())
                {
                    try
                    {
                        // 1. Önce bağımlı özellikleri uçuruyoruz
                        await db.ExecuteAsync(deleteAttributesSql, new { Id = id }, transaction);

                        // 2. Ana ürünü siliyoruz
                        var affectedRows = await db.ExecuteAsync(deleteProductSql, new { Id = id }, transaction);

                        transaction.Commit();
                        return affectedRows > 0;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new Exception($"Ürün envanterden silinirken hata oluştu: {ex.Message}");
                    }
                }
            }
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            var sql = "SELECT id, categoryname FROM categories ORDER BY categoryname;";
            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                return await db.QueryAsync<Category>(sql);
            }
        }

        public async Task<IEnumerable<CategoryAttributeTemplate>> GetAttributesByCategoryIdAsync(int categoryId)
        {
            var sql = "SELECT id, categoryid, attributename FROM category_attribute_templates WHERE categoryid = @CategoryId;";
            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                return await db.QueryAsync<CategoryAttributeTemplate>(sql, new { CategoryId = categoryId });
            }
        }

        public async Task<bool> UpdateProductAsync(Product product)
        {
            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                db.Open();
                using (var transaction = db.BeginTransaction())
                {
                    try
                    {
                        
                        var updateProductSql = @"
                            UPDATE products 
                            SET productname = @ProductName, 
                                description = @Description, 
                                price = @Price, 
                                stockquantity = @StockQuantity, 
                                categoryid = @CategoryId,
                                image_url = @ImageUrl
                            WHERE id = @Id;";

                        await db.ExecuteAsync(updateProductSql, product, transaction);

                        var deleteOldAttributesSql = "DELETE FROM productattributes WHERE productid = @Id;";
                        await db.ExecuteAsync(deleteOldAttributesSql, new { Id = product.Id }, transaction);

                        if (product.Attributes != null && product.Attributes.Any())
                        {
                            var insertNewAttributesSql = @"
                                INSERT INTO productattributes (productid, attributename, attributevalue)
                                VALUES (@ProductId, @AttributeName, @AttributeValue);";

                            foreach (var attr in product.Attributes)
                            {
                                attr.ProductId = product.Id;
                            }

                            await db.ExecuteAsync(insertNewAttributesSql, product.Attributes, transaction);
                        }

                        transaction.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        Console.WriteLine($"Güncelleme hatası: {ex.Message}");
                        return false;
                    }
                }
            }
        }

        public async Task<bool> CreateCategoryWithAttributesAsync(CreateCategoryDto dto)
        {
            if (dto.AttributeNames != null)
            {
                var cleanAttributes = dto.AttributeNames
                    .Where(attr => !string.IsNullOrWhiteSpace(attr))
                    .ToList();

                if (cleanAttributes.Count != cleanAttributes.Distinct(StringComparer.OrdinalIgnoreCase).Count())
                {
                    throw new Exception("Aynı isimli iki özellik olamaz.");
                }
            }

            var trimmedCategoryName = dto.CategoryName?.Trim();

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                db.Open();

                var checkCategorySql = "SELECT EXISTS(SELECT 1 FROM categories WHERE LOWER(TRIM(categoryname)) = LOWER(TRIM(@CategoryName)));";
                bool categoryExists = await db.ExecuteScalarAsync<bool>(checkCategorySql, new { CategoryName = trimmedCategoryName });

                if (categoryExists)
                {
                    throw new Exception("Mevcut isimli bir kategori ismi girdiniz.");
                }

                using (var transaction = db.BeginTransaction())
                {
                    try
                    {
                        var insertCategorySql = @"
                            INSERT INTO categories (categoryname) 
                            VALUES (@CategoryName) 
                            RETURNING id;";

                        int newCategoryId = await db.ExecuteScalarAsync<int>(insertCategorySql, new { CategoryName = trimmedCategoryName }, transaction);

                        if (dto.AttributeNames != null && dto.AttributeNames.Any())
                        {
                            var insertAttributesSql = @"
                                INSERT INTO category_attribute_templates (categoryid, attributename) 
                                VALUES (@CategoryId, @AttributeName);";

                            foreach (var attrName in dto.AttributeNames)
                            {
                                if (!string.IsNullOrWhiteSpace(attrName))
                                {
                                    await db.ExecuteAsync(insertAttributesSql, new { CategoryId = newCategoryId, AttributeName = attrName.Trim() }, transaction);
                                }
                            }
                        }

                        transaction.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        Console.WriteLine($"Kategori ekleme hatası: {ex.Message}");
                        throw;
                    }
                }
            }
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var sql = "DELETE FROM categories WHERE id = @Id;";

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                try
                {
                    var affectedRows = await db.ExecuteAsync(sql, new { Id = id });
                    return affectedRows > 0;
                }
                catch (PostgresException ex) when (ex.SqlState == "23503")
                {
                    throw new Exception("Bu kategoriye bağlı ürünler bulunmaktadır. Kategori silinemedi! Lütfen önce ürünleri başka bir kategoriye taşıyın veya silin.");
                }
                catch (Exception ex)
                {
                    throw new Exception($"Kategori silinirken beklenmedik bir hata oluştu: {ex.Message}");
                }
            }
        }
    }
}