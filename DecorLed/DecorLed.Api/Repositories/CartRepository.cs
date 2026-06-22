using Dapper;
using DecorLed.Api.Models;
using Npgsql;
using System.Data;

namespace DecorLed.Api.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly string _connectionString;

        public CartRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

        public async Task<IEnumerable<CartItem>> GetByUserIdAsync(int userId)
        {
            // 🚨 DÜZELTME: p.stock_quantity yerine p.stockquantity yazıldı
            const string query = @"
                SELECT 
                    c.id AS Id, c.user_id AS UserId, c.product_id AS ProductId, c.quantity AS Quantity, c.created_at AS CreatedAt,
                    p.productname AS ProductName, p.price AS Price, p.image_url AS ImageUrl, p.stockquantity AS StockQuantity
                FROM cart_items c
                INNER JOIN products p ON c.product_id = p.id
                WHERE c.user_id = @UserId
                ORDER BY c.created_at DESC;";

            using var connection = CreateConnection();
            return await connection.QueryAsync<CartItem>(query, new { UserId = userId });
        }

        public async Task<bool> AddToCartAsync(int userId, int productId, int quantity)
        {
            using var connection = CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // 🚨 DÜZELTME: stock_quantity yerine stockquantity sorgulanıyor
                const string stockQuery = "SELECT stockquantity FROM products WHERE id = @ProductId;";
                int currentStock = await connection.ExecuteScalarAsync<int>(stockQuery, new { ProductId = productId }, transaction);

                const string cartCheckQuery = "SELECT quantity FROM cart_items WHERE user_id = @UserId AND product_id = @ProductId;";
                int? existingQuantity = await connection.ExecuteScalarAsync<int?>(cartCheckQuery, new { UserId = userId, ProductId = productId }, transaction);

                int totalRequestedQuantity = quantity + (existingQuantity ?? 0);

                if (totalRequestedQuantity > currentStock)
                {
                    return false;
                }

                if (existingQuantity.HasValue)
                {
                    const string updateQuery = @"
                        UPDATE cart_items 
                        SET quantity = @Quantity, updated_at = CURRENT_TIMESTAMP 
                        WHERE user_id = @UserId AND product_id = @ProductId;";

                    await connection.ExecuteAsync(updateQuery, new { Quantity = totalRequestedQuantity, UserId = userId, ProductId = productId }, transaction);
                }
                else
                {
                    const string insertQuery = @"
                        INSERT INTO cart_items (user_id, product_id, quantity) 
                        VALUES (@UserId, @ProductId, @Quantity);";

                    await connection.ExecuteAsync(insertQuery, new { UserId = userId, ProductId = productId, Quantity = quantity }, transaction);
                }

                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> UpdateQuantityAsync(int userId, int productId, int quantity)
        {
            if (quantity <= 0) return await RemoveFromCartAsync(userId, productId);

            using var connection = CreateConnection();

            // 🚨 DÜZELTME: stock_quantity yerine stockquantity sorgulanıyor
            const string stockQuery = "SELECT stockquantity FROM products WHERE id = @ProductId;";
            int currentStock = await connection.ExecuteScalarAsync<int>(stockQuery, new { ProductId = productId });

            if (quantity > currentStock)
            {
                return false;
            }

            const string query = @"
                UPDATE cart_items 
                SET quantity = @Quantity, updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = @UserId AND product_id = @ProductId;";

            int affectedRows = await connection.ExecuteAsync(query, new { Quantity = quantity, UserId = userId, ProductId = productId });
            return affectedRows > 0;
        }

        public async Task<bool> RemoveFromCartAsync(int userId, int productId)
        {
            const string query = "DELETE FROM cart_items WHERE user_id = @UserId AND product_id = @ProductId;";
            using var connection = CreateConnection();
            int affectedRows = await connection.ExecuteAsync(query, new { UserId = userId, ProductId = productId });
            return affectedRows > 0;
        }

        public async Task<bool> ClearCartAsync(int userId)
        {
            const string query = "DELETE FROM cart_items WHERE user_id = @UserId;";
            using var connection = CreateConnection();
            int affectedRows = await connection.ExecuteAsync(query, new { UserId = userId });
            return affectedRows > 0;
        }
    }
}