// Repositories/UserRepository.cs
using System;
using System.Threading.Tasks;
using Dapper;
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
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration), "Veritabanı bağlantı cümlesi bulunamadı!");
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT id AS Id, 
                       username AS Username, 
                       full_name AS FullName, 
                       email AS Email, 
                       phone_number AS PhoneNumber, 
                       passwordhash AS PasswordHash, 
                       role AS Role, 
                       created_at AS CreatedAt 
                FROM public.users 
                WHERE username = @Username;";

            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT id AS Id, 
                       username AS Username, 
                       full_name AS FullName, 
                       email AS Email, 
                       phone_number AS PhoneNumber, 
                       passwordhash AS PasswordHash, 
                       role AS Role, 
                       created_at AS CreatedAt 
                FROM public.users 
                WHERE email = @Email;";

            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }

        public async Task<int> CreateUserAsync(User user)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                INSERT INTO public.users (username, full_name, email, phone_number, passwordhash, role, created_at)
                VALUES (@Username, @FullName, @Email, @PhoneNumber, @PasswordHash, @Role, @CreatedAt)
                RETURNING id;";

            return await connection.ExecuteScalarAsync<int>(sql, user);
        }
    }
}