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
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            var sql = @"
                SELECT p.*, pa.* FROM products p
                LEFT JOIN productattributes pa ON p.Id = pa.ProductId
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
                    splitOn: "Id"
                );
                return productDictionary.Values;
            }
        }

        public async Task<Product> AddProductAsync(Product product)
        {
            var insertProductSql = @"
                INSERT INTO products (ProductName, Description, Price, StockQuantity, CategoryId)
                VALUES (@ProductName, @Description, @Price, @StockQuantity, @CategoryId)
                RETURNING Id;";

            var insertAttributeSql = @"
                INSERT INTO productattributes (ProductId, AttributeName, AttributeValue)
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

                            // 🔥 OPTİMİZASYON: Foreach döngüsüyle tek tek execute etmek yerine Dapper'a listeyi topluca verdik.
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
            // 🔥 İYİLEŞTİRME: Tablonda ON DELETE CASCADE olduğu için productattributes'ı elle silme kodunu kaldırdık.
            // Sadece ürünü sildiğinde PostgreSQL alt özellikleri otomatik temizler.
            var deleteProductSql = "DELETE FROM products WHERE Id = @Id;";

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                // Tek bir SQL cümlesi çalışacağı için ekstra Transaction bloğuna ihtiyaç kalmadı (PostgreSQL bunu atomik yürütür).
                var affectedRows = await db.ExecuteAsync(deleteProductSql, new { Id = id });
                return affectedRows > 0;
            }
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            var sql = "SELECT Id, CategoryName FROM categories ORDER BY CategoryName;";
            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                return await db.QueryAsync<Category>(sql);
            }
        }

        public async Task<IEnumerable<CategoryAttributeTemplate>> GetAttributesByCategoryIdAsync(int categoryId)
        {
            var sql = "SELECT Id, CategoryId, AttributeName FROM category_attribute_templates WHERE CategoryId = @CategoryId;";
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
                            SET ProductName = @ProductName, Description = @Description, Price = @Price, StockQuantity = @StockQuantity, CategoryId = @CategoryId
                            WHERE Id = @Id;";

                        await db.ExecuteAsync(updateProductSql, product, transaction);

                        // Eski özellikleri temizle ve yenileri ekle (Dinamik formlarda en temiz ve bug-free yöntem budur)
                        var deleteOldAttributesSql = "DELETE FROM productattributes WHERE ProductId = @Id;";
                        await db.ExecuteAsync(deleteOldAttributesSql, new { Id = product.Id }, transaction);

                        if (product.Attributes != null && product.Attributes.Any())
                        {
                            var insertNewAttributesSql = @"
                                INSERT INTO productattributes (ProductId, AttributeName, AttributeValue)
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

            // 🔥 FIX: İsim kontrolü yaparken başındaki ve sonundaki boşlukları hem veritabanında hem gelen veride temizliyoruz (TRIM)
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
            var sql = "DELETE FROM categories WHERE Id = @Id;";

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                try
                {
                    var affectedRows = await db.ExecuteAsync(sql, new { Id = id });
                    return affectedRows > 0;
                }
                // 💡 SİHİRLİ DOKUNUŞ: PostgreSQL'e özel hata yakalama
                catch (PostgresException ex) when (ex.SqlState == "23503")
                {
                    // Veri tabanı "İlişkili veri var!" dediğinde bu hata kodu (23503) tetiklenir.
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