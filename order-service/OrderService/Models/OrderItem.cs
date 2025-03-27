using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrderService.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        public int MenuItemId { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public decimal Price { get; set; }
        
        [Required]
        public int Quantity { get; set; }
        
        [Required]
        public decimal SubTotal { get; set; }
        
        public string SpecialInstructions { get; set; }
        
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }
    }
}