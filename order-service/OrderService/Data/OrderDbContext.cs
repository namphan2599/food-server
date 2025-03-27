using Microsoft.EntityFrameworkCore;
using OrderService.Models;

namespace OrderService.Data
{
    public class OrderDbContext : DbContext
    {
        public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options)
        {
        }
        
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure relationships
            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Configure decimal precision
            modelBuilder.Entity<Order>()
                .Property(o => o.SubTotal)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<Order>()
                .Property(o => o.DeliveryFee)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<Order>()
                .Property(o => o.Tax)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<Order>()
                .Property(o => o.Total)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.Price)
                .HasColumnType("decimal(18,2)");
                
            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.SubTotal)
                .HasColumnType("decimal(18,2)");
        }
    }
}