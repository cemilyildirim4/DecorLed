namespace DecorLed.Api.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Siparişe ait alt ürünlerin listesi
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}