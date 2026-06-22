using DecorLed.Api.Models;

namespace DecorLed.Api.Repositories
{
    public interface IOrderRepository
    {
        // Kullanıcının sepetindeki ürünleri siparişe dönüştürür (Esas sihir burada)
        Task<int?> CreateOrderFromCartAsync(int userId);

        // Kullanıcının geçmiş siparişlerini listeler
        Task<IEnumerable<Order>> GetUserOrdersAsync(int userId);

        // Sipariş detayını getirir
        Task<Order?> GetOrderDetailsAsync(int orderId, int userId);
    }
}