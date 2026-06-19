namespace DecorLed.Api.Models
{
    public class CreateCategoryDto
    {
        public string CategoryName { get; set; }
        public List<string> AttributeNames { get; set; }
    }   
}
