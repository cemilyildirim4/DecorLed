using DecorLed.Api.Models;

namespace DecorLed.Api.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<Product> AddProductAsync(Product product);
        Task<bool> DeleteProductAsync(int id);

       
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<IEnumerable<CategoryAttributeTemplate>> GetAttributesByCategoryIdAsync(int categoryId);

        Task<bool> UpdateProductAsync(Product product);

        Task<bool> CreateCategoryWithAttributesAsync(CreateCategoryDto dto);

        Task<bool> DeleteCategoryAsync(int id);
    }
}