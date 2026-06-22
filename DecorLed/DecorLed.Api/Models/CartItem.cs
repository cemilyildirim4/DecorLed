namespace DecorLed.Api.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // İlişkili Ürün Detayları (Sepet listelenirken React'e ürün adı, fiyatı ve resmini de dönmek için)
        public string? ProductName { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public int StockQuantity { get; set; } // Anlık stok kontrolü için kritik alan!
    }
}