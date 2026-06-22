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

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Sadece .jpg, .jpeg, .png ve .webp formatları desteklenir." });

            // 2. Benzersiz Dosya Adı
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";

            // 🛠️ KRİTİK DÜZELTME: Eğer wwwroot henüz oluşmadıysa WebRootPath null gelir.
            // Eğer null ise projenin ana çalışma dizinine (ContentRootPath) gidip wwwroot'u biz hedefliyoruz.
            var rootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

            var uploadsFolder = Path.Combine(rootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder); // wwwroot ve altındaki uploads klasörünü otomatik oluşturur
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 4. Dosyayı Klasöre Yazma
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 5. Tarayıcıdan erişilecek URL
            var fileUrl = $"/uploads/{uniqueFileName}";

            return Ok(new { imageUrl = fileUrl });
        }
    }
}