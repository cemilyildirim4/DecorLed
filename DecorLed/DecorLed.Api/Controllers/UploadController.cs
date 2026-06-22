using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DecorLed.Api.Controllers
{
    [Authorize] // 🔒 GÜVENLİK: Sadece JWT token'ı olan yetkili kullanıcılar/adminler dosya yükleyebilir.
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            // 1. Temel Geçerlilik Kontrolü
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Lütfen geçerli bir dosya seçin." });

            // 2. Boyut Sınırı Kontrolü (Örn: Maksimum 5 MB)
            const long maxFileSize = 5 * 1024 * 1024; // 5 Megabayt bayt cinsinden
            if (file.Length > maxFileSize)
                return BadRequest(new { message = "Yüklenen dosya çok büyük! Maksimum dosya boyutu 5 MB olmalıdır. ⚠️" });

            // 3. Uzantı (Format) Güvenlik Kontrolü
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Sadece .jpg, .jpeg, .png ve .webp formatları desteklenir." });

            try
            {
                // 4. Klasör Yapısının Hazırlanması
                var rootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
                var uploadsFolder = Path.Combine(rootPath, "uploads");
                
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // 5. Benzersiz Dosya Adı Üretimi (Çakışmaları önler)
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // 6. Dosyayı Asenkron Olarak Diske Yazma
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 7. React Tarafına Dönülecek Göreceli (Relative) URL
                var fileUrl = $"/uploads/{uniqueFileName}";

                return Ok(new { imageUrl = fileUrl });
            }
            catch (Exception ex)
            {
                // İşletim sistemi veya disk yazma hatalarını yakalamak için catch bloğu şarttır
                return StatusCode(500, new { message = $"Dosya kaydedilirken sunucu hatası oluştu: {ex.Message}" });
            }
        }
    }
}