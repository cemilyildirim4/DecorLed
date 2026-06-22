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
                            // 🚨 KRİTİK DÜZELTME: Kullanıcı ID bilgisini token içine gömüyoruz.
                            // (Eğer modelinde ID alanı küçük harfle 'id' ise 'dbUser.id' yapabilirsin)
                            new Claim(ClaimTypes.NameIdentifier, dbUser.Id.ToString()),

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

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var username = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { message = "Kullanıcı bilgileri doğrulanamadı." });
            }

            return Ok(new { username });
        }
    }
}