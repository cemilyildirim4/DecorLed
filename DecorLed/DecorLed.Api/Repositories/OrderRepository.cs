using Dapper;
using DecorLed.Api.Models;
using Npgsql;
using System.Data;

namespace DecorLed.Api.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly string _connectionString;

        public OrderRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

        public async Task<int?> CreateOrderFromCartAsync(int userId)
        {
            using var connection = CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Kullanıcının sepetindeki güncel ürünleri ve fiyatlarını getir
                // 🚨 POSTGRESQL UYUMU: Alias isimleri tamamen küçük harf yapıldı
                const string cartQuery = @"
            SELECT c.product_id AS productid, c.quantity AS quantity, p.price AS price, p.stockquantity AS stockquantity
            FROM cart_items c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = @UserId;";

                var cartItems = (await connection.QueryAsync<dynamic>(cartQuery, new { UserId = userId }, transaction)).ToList();

                if (!cartItems.Any()) return null;

                // 2. Stok kontrolü ve Toplam Tutar Hesaplama
                decimal totalAmount = 0;
                foreach (var item in cartItems)
                {
                    // 🚨 POSTGRESQL UYUMU: Dinamik nesne özellikleri tamamen küçük harfle okunuyor
                    if (item.quantity > item.stockquantity)
                    {
                        transaction.Rollback();
                        return null;
                    }
                    totalAmount += (decimal)(item.price * item.quantity);
                }

                // 3. Ana Siparişi (orders) oluştur
                const string insertOrderQuery = @"
            INSERT INTO orders (user_id, total_amount, status) 
            VALUES (@UserId, @TotalAmount, 'Pending') 
            RETURNING id;";

                int orderId = await connection.ExecuteScalarAsync<int>(insertOrderQuery, new { UserId = userId, TotalAmount = totalAmount }, transaction);

                // 4. Sepetteki ürünleri order_items tablosuna taşı ve products tablosundan STOK DÜŞ
                foreach (var item in cartItems)
                {
                    const string insertItemQuery = @"
                INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (@OrderId, @ProductId, @Quantity, @Price);";

                    await connection.ExecuteAsync(insertItemQuery, new
                    {
                        OrderId = orderId,
                        ProductId = item.productid,
                        Quantity = item.quantity,
                        Price = item.price
                    }, transaction);

                    // Stok miktarını eksilt
                    const string updateStockQuery = @"
                UPDATE products 
                SET stockquantity = stockquantity - @Quantity 
                WHERE id = @ProductId;";

                    await connection.ExecuteAsync(updateStockQuery, new
                    {
                        Quantity = item.quantity,
                        ProductId = item.productid
                    }, transaction);
                }

                // 5. Kullanıcının sepetini boşalt
                const string clearCartQuery = "DELETE FROM cart_items WHERE user_id = @UserId;";
                await connection.ExecuteAsync(clearCartQuery, new { UserId = userId }, transaction);

                transaction.Commit();
                return orderId;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(int userId)
        {
            const string query = "SELECT id, user_id AS UserId, total_amount AS TotalAmount, status, created_at AS CreatedAt FROM orders WHERE user_id = @UserId ORDER BY created_at DESC;";
            using var connection = CreateConnection();
            return await connection.QueryAsync<Order>(query, new { UserId = userId });
        }

        public async Task<Order?> GetOrderDetailsAsync(int orderId, int userId)
        {
            using var connection = CreateConnection();

            const string orderQuery = "SELECT id, user_id AS UserId, total_amount AS TotalAmount, status, created_at AS CreatedAt FROM orders WHERE id = @OrderId AND user_id = @UserId;";
            var order = await connection.QueryFirstOrDefaultAsync<Order>(orderQuery, new { OrderId = orderId, UserId = userId });

            if (order != null)
            {
                const string itemsQuery = @"
                    SELECT oi.id, oi.order_id AS OrderId, oi.product_id AS ProductId, oi.quantity, oi.price, p.productname AS ProductName
                    FROM order_items oi
                    INNER JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = @OrderId;";

                var items = await connection.QueryAsync<OrderItem>(itemsQuery, new { OrderId = orderId });
                order.Items = items.ToList();
            }

            return order;
        }
    }
}