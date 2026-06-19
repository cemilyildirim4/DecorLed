using DecorLed.Api.Models;

namespace DecorLed.Api.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByUsernameAsync(string username);
    }
}