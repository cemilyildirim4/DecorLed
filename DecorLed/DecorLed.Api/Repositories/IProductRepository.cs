using DecorLed.Api.Models;

namespace DecorLed.Api.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
    }
}
