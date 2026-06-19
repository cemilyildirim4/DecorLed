using DecorLed.Api.Models;
using DecorLed.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DecorLed.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _productRepository;

        public ProductsController(IProductRepository productRepository) 
        {
            _productRepository = productRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var products = await _productRepository.GetAllProductsAsync();

                if (products == null || !products.Any())
                {
                    return NoContent();
                }

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Veritabanı bağlantısı sırasında bir hata oluştu {ex.Message}");
            }
           
            
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            if (product == null)
            {
                return BadRequest("Gönderilen ürün verisi boş olamaz!");
            }

            try
            {
                var createdProduct = await _productRepository.AddProductAsync(product);

               return Ok(createdProduct);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var isDeleted = await _productRepository.DeleteProductAsync(id);

                if (!isDeleted)
                {
                    return NotFound($"Silinmek istenen {id} numaralı ürün veri tabanında bulunamadı.");
                }

                return Ok(new { message = "Ürün ve bağlı tüm özellikleri başarıyla silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _productRepository.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("categories/{categoryId}/attributes")]
        public async Task<IActionResult> GetCategoryAttributes(int categoryId)
        {
            var templates = await _productRepository.GetAttributesByCategoryIdAsync(categoryId);
            return Ok(templates);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            product.Id = id; // URL'den gelen Id'yi model içine gömüyoruz
            var success = await _productRepository.UpdateProductAsync(product);

            if (!success)
                return BadRequest("Ürün güncelleme işlemi başarısız oldu.");

            return Ok();
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CategoryName))
                return BadRequest("Kategori adı boş olamaz.");

            try
            {
                var success = await _productRepository.CreateCategoryWithAttributesAsync(dto);
                return Ok(new { message = "Kategori ve şablon başarıyla mühürlendi." });
            }
            catch (Exception ex)
            {
               
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
               
                var isDeleted = await _productRepository.DeleteCategoryAsync(id);

                if (!isDeleted)
                {
                    return NotFound(new { message = "Silinmek istenen kategori bulunamadı." });
                }

                return Ok(new { message = "Kategori başarıyla silindi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
    }
}
