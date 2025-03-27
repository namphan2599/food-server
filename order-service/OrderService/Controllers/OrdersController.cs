using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.DTOs;
using OrderService.Models;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderDbContext _context;
        
        public OrdersController(OrderDbContext context)
        {
            _context = context;
        }
        
        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetOrders(
            [FromQuery] int? userId,
            [FromQuery] int? restaurantId,
            [FromQuery] OrderStatus? status)
        {
            var query = _context.Orders.Include(o => o.OrderItems).AsQueryable();
            
            if (userId.HasValue)
            {
                query = query.Where(o => o.UserId == userId.Value);
            }
            
            if (restaurantId.HasValue)
            {
                query = query.Where(o => o.RestaurantId == restaurantId.Value);
            }
            
            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }
            
            var orders = await query.ToListAsync();
            
            return orders.Select(o => new OrderResponseDTO
            {
                Id = o.Id,
                UserId = o.UserId,
                RestaurantId = o.RestaurantId,
                OrderDate = o.OrderDate,
                DeliveryDate = o.DeliveryDate,
                SubTotal = o.SubTotal,
                DeliveryFee = o.DeliveryFee,
                Tax = o.Tax,
                Total = o.Total,
                Status = o.Status,
                DeliveryAddress = o.DeliveryAddress,
                DeliveryInstructions = o.DeliveryInstructions,
                DeliveryPartnerId = o.DeliveryPartnerId,
                IsPaid = o.IsPaid,
                Items = o.OrderItems.Select(oi => new OrderItemResponseDTO
                {
                    Id = oi.Id,
                    MenuItemId = oi.MenuItemId,
                    Name = oi.Name,
                    Description = oi.Description,
                    Price = oi.Price,
                    Quantity = oi.Quantity,
                    SubTotal = oi.SubTotal,
                    SpecialInstructions = oi.SpecialInstructions
                }).ToList()
            }).ToList();
        }
        
        // GET: api/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponseDTO>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);
                
            if (order == null)
            {
                return NotFound();
            }
            
            return new OrderResponseDTO
            {
                Id = order.Id,
                UserId = order.UserId,
                RestaurantId = order.RestaurantId,
                OrderDate = order.OrderDate,
                DeliveryDate = order.DeliveryDate,
                SubTotal = order.SubTotal,
                DeliveryFee = order.DeliveryFee,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status,
                DeliveryAddress = order.DeliveryAddress,
                DeliveryInstructions = order.DeliveryInstructions,
                DeliveryPartnerId = order.DeliveryPartnerId,
                IsPaid = order.IsPaid,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                {
                    Id = oi.Id,
                    MenuItemId = oi.MenuItemId,
                    Name = oi.Name,
                    Description = oi.Description,
                    Price = oi.Price,
                    Quantity = oi.Quantity,
                    SubTotal = oi.SubTotal,
                    SpecialInstructions = oi.SpecialInstructions
                }).ToList()
            };
        }
        
        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<OrderResponseDTO>> CreateOrder(CreateOrderDTO createOrderDTO)
        {
            // Calculate subtotal
            decimal subtotal = createOrderDTO.Items.Sum(i => i.Price * i.Quantity);
            
            // Apply tax (assuming 10%)
            decimal tax = subtotal * 0.1m;
            
            // Apply delivery fee (flat fee for simplicity)
            decimal deliveryFee = 5.0m;
            
            // Calculate total
            decimal total = subtotal + tax + deliveryFee;
            
            var order = new Order
            {
                UserId = createOrderDTO.UserId,
                RestaurantId = createOrderDTO.RestaurantId,
                OrderDate = DateTime.UtcNow,
                SubTotal = subtotal,
                DeliveryFee = deliveryFee,
                Tax = tax,
                Total = total,
                Status = OrderStatus.Created,
                DeliveryAddress = createOrderDTO.DeliveryAddress,
                DeliveryInstructions = createOrderDTO.DeliveryInstructions,
                IsPaid = false,
                OrderItems = createOrderDTO.Items.Select(i => new OrderItem
                {
                    MenuItemId = i.MenuItemId,
                    Name = i.Name,
                    Description = i.Description,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    SubTotal = i.Price * i.Quantity,
                    SpecialInstructions = i.SpecialInstructions
                }).ToList()
            };
            
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new OrderResponseDTO
            {
                Id = order.Id,
                UserId = order.UserId,
                RestaurantId = order.RestaurantId,
                OrderDate = order.OrderDate,
                DeliveryDate = order.DeliveryDate,
                SubTotal = order.SubTotal,
                DeliveryFee = order.DeliveryFee,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status,
                DeliveryAddress = order.DeliveryAddress,
                DeliveryInstructions = order.DeliveryInstructions,
                DeliveryPartnerId = order.DeliveryPartnerId,
                IsPaid = order.IsPaid,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                {
                    Id = oi.Id,
                    MenuItemId = oi.MenuItemId,
                    Name = oi.Name,
                    Description = oi.Description,
                    Price = oi.Price,
                    Quantity = oi.Quantity,
                    SubTotal = oi.SubTotal,
                    SpecialInstructions = oi.SpecialInstructions
                }).ToList()
            });
        }
        
        // PUT: api/orders/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDTO updateOrderStatusDTO)
        {
            var order = await _context.Orders.FindAsync(id);
            
            if (order == null)
            {
                return NotFound();
            }
            
            order.Status = updateOrderStatusDTO.Status;
            
            if (updateOrderStatusDTO.Status == OrderStatus.Delivered)
            {
                order.DeliveryDate = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // PUT: api/orders/5/delivery-partner
        [HttpPut("{id}/delivery-partner")]
        public async Task<IActionResult> AssignDeliveryPartner(int id, AssignDeliveryPartnerDTO assignDeliveryPartnerDTO)
        {
            var order = await _context.Orders.FindAsync(id);
            
            if (order == null)
            {
                return NotFound();
            }
            
            order.DeliveryPartnerId = assignDeliveryPartnerDTO.DeliveryPartnerId;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // PUT: api/orders/5/payment
        [HttpPut("{id}/payment")]
        public async Task<IActionResult> MarkAsPaid(int id, [FromBody] string paymentIntentId)
        {
            var order = await _context.Orders.FindAsync(id);
            
            if (order == null)
            {
                return NotFound();
            }
            
            order.PaymentIntentId = paymentIntentId;
            order.IsPaid = true;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}