using DecorLed.Api.Models;

namespace DecorLed.Api.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> GetUserByEmailAsync(string email);
        Task<int> CreateUserAsync(User user);
    }
}