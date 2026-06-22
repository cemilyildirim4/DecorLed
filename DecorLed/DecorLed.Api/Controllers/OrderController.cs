using DecorLed.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DecorLed.Api.Controllers
{
    [Authorize] // 🔒 Sipariş işlemleri tamamen giriş yapmış gerçek müşterilere özeldir.
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;

        public OrderController(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        // 💡 Yardımcı Metot: Token içerisinden güvenle User ID söker.
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("Sipariş işlemi için geçerli kullanıcı kimliği bulunamadı.");
            }
            return int.Parse(userIdClaim.Value);
        }

        /// <summary>
        /// Satın Al / Siparişi Tamamla (Checkout)
        /// Kullanıcının sepetindeki ürünleri resmi bir siparişe dönüştürür, stoğu düşer ve sepeti temizler.
        /// </summary>
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout()
        {
            try
            {
                int userId = GetCurrentUserId();

                // Sipariş oluşturma sürecini başlat (Repository içindeki Transaction tetiklenir)
                int? orderId = await _orderRepository.CreateOrderFromCartAsync(userId);

                if (orderId == null)
                {
                    return BadRequest(new { message = "Sipariş oluşturulamadı. Sepetiniz boş olabilir veya talep ettiğiniz ürünlerin stoğu tükenmiş olabilir! ⚠️" });
                }

                return Ok(new
                {
                    message = "Siparişiniz başarıyla alındı! Ödeme onaylandı ve stoklar güncellendi. 📦🎉",
                    orderId = orderId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Sipariş tamamlanırken kritik hata oluştu: {ex.Message}" });
            }
        }

        /// <summary>
        /// Giriş yapmış kullanıcının geçmiş tüm siparişlerini listeler.
        /// </summary>
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            try
            {
                int userId = GetCurrentUserId();
                var orders = await _orderRepository.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Sipariş geçmişi getirilirken hata oluştu: {ex.Message}" });
            }
        }

        /// <summary>
        /// Belirli bir siparişin detaylarını (içindeki ürünleri, adetleri ve satın alma fiyatlarını) getirir.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                var order = await _orderRepository.GetOrderDetailsAsync(id, userId);

                if (order == null)
                {
                    return NotFound(new { message = "Sipariş bulunamadı veya bu siparişi görüntüleme yetkiniz yok. ❌" });
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Sipariş detayları getirilirken hata oluştu: {ex.Message}" });
            }
        }
    }
}