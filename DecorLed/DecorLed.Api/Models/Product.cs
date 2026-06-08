namespace DecorLed.Api.Models
{
    public class Product
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public DateTime CreateDate  { get; set; }

        public List<ProductAttribute> Attributes { get; set; } = new();
    }
}
