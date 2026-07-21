using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DecorLed.Api.Models;
using DecorLed.Api.Repositories;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;

namespace DecorLed.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Hem kullanıcı adı hem de e-posta ile girişe izin verelim
            var dbUser = await _userRepository.GetUserByUsernameAsync(request.Username)
                         ?? await _userRepository.GetUserByEmailAsync(request.Username);

            if (dbUser != null)
            {
                bool isPasswordCorrect = false;
                try
                {
                    isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, dbUser.PasswordHash);
                }
                catch
                {
                    isPasswordCorrect = false;
                }

                if (isPasswordCorrect)
                {
                    string token = GenerateJwtToken(dbUser);
                    return Ok(new { token });
                }
            }

            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı!" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 1. E-posta adresi kullanımda mı kontrolü
            var existingUser = await _userRepository.GetUserByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Bu e-posta adresi zaten kullanımda." });

            // 2. Şifreyi hash'le
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // 3. Yeni kullanıcı modelini doldur (Username varsayılan olarak e-posta adresi seçildi)
            var newUser = new User
            {
                Username = dto.Email,
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = passwordHash,
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };

            // 4. Veritabanına kaydet ve üretilen ID'yi al
            int newUserId = await _userRepository.CreateUserAsync(newUser);
            newUser.Id = newUserId;

            // 5. Otomatik giriş için JWT Token üret
            string token = GenerateJwtToken(newUser);

            return Ok(new
            {
                message = "Kayıt başarıyla tamamlandı ve oturum açıldı.",
                token = token,
                user = new
                {
                    id = newUser.Id,
                    fullName = newUser.FullName,
                    email = newUser.Email,
                    role = newUser.Role
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var username = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "user";

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { message = "Kullanıcı bilgileri doğrulanamadı." });
            }

            return Ok(new { username, role });
        }

        // --- MERKEZİ JWT ÜRETİM METODU ---
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = _configuration["JwtSettings:SecretKey"];

            if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
            {
                throw new InvalidOperationException("Sunucu yapılandırma hatası: JWT Anahtarı bulunamadı veya kısa.");
            }

            var key = Encoding.UTF8.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role ?? "User")
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}