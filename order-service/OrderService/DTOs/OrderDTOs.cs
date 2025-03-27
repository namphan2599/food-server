using System;
using System.Collections.Generic;
using OrderService.Models;

namespace OrderService.DTOs
{
    public class OrderItemDTO
    {
        public int MenuItemId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string SpecialInstructions { get; set; }
    }
    
    public class CreateOrderDTO
    {
        public int UserId { get; set; }
        public int RestaurantId { get; set; }
        public string DeliveryAddress { get; set; }
        public string DeliveryInstructions { get; set; }
        public List<OrderItemDTO> Items { get; set; }
    }
    
    public class OrderResponseDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RestaurantId { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DeliveryFee { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public OrderStatus Status { get; set; }
        public string DeliveryAddress { get; set; }
        public string DeliveryInstructions { get; set; }
        public int? DeliveryPartnerId { get; set; }
        public bool IsPaid { get; set; }
        public List<OrderItemResponseDTO> Items { get; set; }
    }
    
    public class OrderItemResponseDTO
    {
        public int Id { get; set; }
        public int MenuItemId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal SubTotal { get; set; }
        public string SpecialInstructions { get; set; }
    }
    
    public class UpdateOrderStatusDTO
    {
        public OrderStatus Status { get; set; }
    }
    
    public class AssignDeliveryPartnerDTO
    {
        public int DeliveryPartnerId { get; set; }
    }
}