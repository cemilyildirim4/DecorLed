using System.Threading.Tasks;
using Dapper; // Veya hangi ORM'i kullanıyorsan
using Npgsql;
using DecorLed.Api.Models;
using Microsoft.Extensions.Configuration;

namespace DecorLed.Api.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // BURAYA DİKKAT: Hem metodun dönüş tipi hem de Query'deki <User> jeneriği doğru olmalı
        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(_connectionString))
                throw new ArgumentNullException(nameof(_connectionString), "Veritabanı bağlantı cümlesi bulunamadı!");

            using var connection = new NpgsqlConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<User?>(
                "SELECT * FROM users WHERE username = @Username", new { Username = username });
        }
    }
}