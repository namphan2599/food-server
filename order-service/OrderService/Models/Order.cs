using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace OrderService.Models
{
    public enum OrderStatus
    {
        Created,
        Confirmed,
        Preparing,
        ReadyForPickup,
        OutForDelivery,
        Delivered,
        Cancelled
    }

    public class Order
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int RestaurantId { get; set; }
        
        [Required]
        public DateTime OrderDate { get; set; }
        
        public DateTime? DeliveryDate { get; set; }
        
        [Required]
        public decimal SubTotal { get; set; }
        
        public decimal DeliveryFee { get; set; }
        
        public decimal Tax { get; set; }
        
        [Required]
        public decimal Total { get; set; }
        
        [Required]
        public OrderStatus Status { get; set; }
        
        public string DeliveryAddress { get; set; }
        
        public string DeliveryInstructions { get; set; }
        
        public int? DeliveryPartnerId { get; set; }
        
        public string PaymentIntentId { get; set; }
        
        public bool IsPaid { get; set; }
        
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}