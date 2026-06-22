namespace DecorLed.Api.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

        // Opsiyonel: React'e sipariş geçmişini gösterirken ürün adını da basabilmek için
        public string? ProductName { get; set; }
    }
}