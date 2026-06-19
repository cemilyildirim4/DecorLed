using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DecorLed.Api.Models;
using DecorLed.Api.Repositories;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization; // 🌟 YENİ: [Authorize] özelliğini kullanabilmek için ekledik

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
            var dbUser = await _userRepository.GetUserByUsernameAsync(request.Username);

            if (dbUser != null)
            {
                bool isPasswordCorrect = false;
                try
                {
                    isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, dbUser.PasswordHash);
                }
                catch
                {
                    // ignore verify exceptions, treat as invalid credentials
                    isPasswordCorrect = false;
                }

                if (isPasswordCorrect)
                {
                    var tokenHandler = new JwtSecurityTokenHandler();

                    var secretKey = _configuration["JwtSettings:SecretKey"];

                    if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
                    {
                        return StatusCode(500, "Sunucu yapılandırma hatası: JWT Anahtarı bulunamadı veya kısa.");
                    }

                    var key = Encoding.UTF8.GetBytes(secretKey);

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new[] {
                            new Claim(ClaimTypes.Name, dbUser.Username),
                            new Claim(ClaimTypes.Role, dbUser.Role ?? "admin")
                        }),
                        Expires = DateTime.UtcNow.AddHours(1),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };

                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    return Ok(new { token = tokenHandler.WriteToken(token) });
                }
            }

            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı!" });
        }

        // 🛡️ 🌟 YENİ EKLENEN ENDPOINT: Sayfa yenilendiğinde token doğrulaması yapar
        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            // Login olurken ClaimTypes.Name içine kaydettiğimiz Username bilgisini token'dan geri okuyoruz
            var username = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { message = "Kullanıcı bilgileri doğrulanamadı." });
            }

            // Frontend tarafındaki AuthContext.jsx'in beklediği nesneyi dönüyoruz
            return Ok(new { username });
        }
    }
}