using DecorLed.Api.Models;

namespace DecorLed.Api.Repositories
{
    public interface ICartRepository
    {
        // Kullanıcının sepetindeki tüm ürünleri detaylarıyla (Ürün adı, fiyatı, resmi, anlık stoğu) getirir
        Task<IEnumerable<CartItem>> GetByUserIdAsync(int userId);

        // Sepete ürün ekler (Stok kontrolü içerir)
        Task<bool> AddToCartAsync(int userId, int productId, int quantity);

        // Sepetteki ürün adetini günceller (Stok kontrolü içerir)
        Task<bool> UpdateQuantityAsync(int userId, int productId, int quantity);

        // Sepetten tek bir ürünü kaldırır
        Task<bool> RemoveFromCartAsync(int userId, int productId);

        // Sipariş tamamlandığında kullanıcının sepetini tamamen boşaltır
        Task<bool> ClearCartAsync(int userId);
    }
}