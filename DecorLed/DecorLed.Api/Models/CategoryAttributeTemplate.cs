namespace DecorLed.Api.Models
{
    public class CategoryAttributeTemplate
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string AttributeName { get; set; } = string.Empty;
    }
}