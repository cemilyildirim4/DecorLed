using DecorLed.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DecorLed.Api.Controllers
{
    [Authorize] // 🔒 Tüm sepet işlemleri giriş yapmış kullanıcılara özeldir.
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;

        public CartController(ICartRepository cartRepository)
        {
            _cartRepository = cartRepository;
        }

        // 💡 Yardımcı Metot: JWT Token içerisinden NameIdentifier (User ID) değerini güvenle söker.
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("Kullanıcı kimliği token içerisinde bulunamadı.");
            }
            return int.Parse(userIdClaim.Value);
        }

        /// <summary>
        /// Giriş yapmış kullanıcının sepetindeki ürünleri listeler.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                int userId = GetCurrentUserId();
                var cartItems = await _cartRepository.GetByUserIdAsync(userId);
                return Ok(cartItems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Sepet listelenirken hata oluştu: {ex.Message}" });
            }
        }

        /// <summary>
        /// Sepete yeni ürün ekler veya varsa adetini artırır (Anlık Stok Kontrollü).
        /// </summary>
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            if (dto.ProductId <= 0 || dto.Quantity <= 0)
                return BadRequest(new { message = "Geçersiz ürün veya adet bilgisi." });

            try
            {
                int userId = GetCurrentUserId();
                bool isSuccess = await _cartRepository.AddToCartAsync(userId, dto.ProductId, dto.Quantity);

                if (!isSuccess)
                {
                    return BadRequest(new { message = "Ürün sepete eklenemedi. Talep edilen miktar stok sınırını aşıyor olabilir! ⚠️" });
                }

                return Ok(new { message = "Ürün başarıyla sepete eklendi. 🛒" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Sepete ekleme yapılırken hata oluştu: {ex.Message}" });
            }
        }

        /// <summary>
        /// Sepetteki ürünün adetini doğrudan günceller (Anlık Stok Kontrollü).
        /// </summary>
        [HttpPut("update")]
        public async Task<IActionResult> UpdateQuantity([FromBody] UpdateCartDto dto)
        {
            if (dto.ProductId <= 0 || dto.Quantity < 0)
                return BadRequest(new { message = "Geçersiz güncelleme talebi." });

            try
            {
                int userId = GetCurrentUserId();
                bool isSuccess = await _cartRepository.UpdateQuantityAsync(userId, dto.ProductId, dto.Quantity);

                if (!isSuccess)
                {
                    return BadRequest(new { message = "Sepet güncellenemedi. Yetersiz stok! ⚠️" });
                }

                return Ok(new { message = "Sepet başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Sepet güncellenirken hata oluştu: {ex.Message}" });
            }
        }

        /// <summary>
        /// Belirli bir ürünü sepetten tamamen kaldırır.
        /// </summary>
        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            try
            {
                int userId = GetCurrentUserId();
                bool isSuccess = await _cartRepository.RemoveFromCartAsync(userId, productId);

                if (!isSuccess)
                    return NotFound(new { message = "Ürün sepette bulunamadı." });

                return Ok(new { message = "Ürün sepetten kaldırıldı." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ürün sepetten silinirken hata oluştu: {ex.Message}" });
            }
        }

        /// <summary>
        /// Kullanıcının sepetini tamamen temizler.
        /// </summary>
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                int userId = GetCurrentUserId();
                await _cartRepository.ClearCartAsync(userId);
                return Ok(new { message = "Sepet tamamen temizlendi." });
            }
            catch (Exception ex)    
            {
                return StatusCode(500, new { message = $"Sepet temizlenirken hata oluştu: {ex.Message}" });
            }
        }
    }

    // --- Veri Transfer Nesneleri (DTOs) ---
    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}