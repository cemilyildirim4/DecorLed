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
                select p.* , pa.* from products p
                left join ProductAttributes pa on p.Id = pa.ProductId
            ";

            using (IDbConnection db = new NpgsqlConnection(_connectionString))
            {
                var productDictionary = new Dictionary<int , Product>();

                var result = await db.QueryAsync<Product, ProductAttribute, Product>(
                    sql,
                    (product, attribute) =>
                     {
                         if (!productDictionary.TryGetValue(product.Id, out var currentProduct))
                         {
                             currentProduct = product;
                             productDictionary.Add(currentProduct.Id, currentProduct);
                         }

                         if (attribute !=null)
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
    }
}
