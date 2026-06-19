using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DecorLed.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env; // Sunucu klasör yollarına erişmek için built-in servis
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            // 1. Güvenlik Kontrolleri
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Lütfen geçerli bir dosya seçin." });

            // Sadece resim formatlarına izin ver
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Sadece .jpg, .jpeg, .png ve .webp formatları desteklenir." });

            // 2. Benzersiz Dosya Adı Oluşturma (Aynı isimli dosyalar birbirini ezmesin)
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";

            // 3. Kaydedilecek Klasörün Ayarlanması (wwwroot/uploads)
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder); // Klasör yoksa oluştur
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 4. Dosyayı Klasöre Yazma
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 5. Tarayıcıdan erişilecek URL'i geri dönüyoruz
            // Örn: /uploads/abc-123-xyz.jpg
            var fileUrl = $"/uploads/{uniqueFileName}";

            return Ok(new { imageUrl = fileUrl });
        }
    }
}