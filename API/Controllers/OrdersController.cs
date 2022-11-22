using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class OrdersController : BaseApiController
    {
        private readonly StoreContext _context;

        public OrdersController(StoreContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            return await _context.Orders
                                .ProjectOrderToOrderDto()
                                .Where(i => i.BuyerId == User.Identity.Name)
                                .ToListAsync();
        }

        [HttpGet("{id}",Name ="GetOrder")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            return await _context.Orders
                    .ProjectOrderToOrderDto()
                    .Where(i => i.BuyerId == User.Identity.Name && i.Id == id)
                    .FirstOrDefaultAsync();
        }
        [HttpPost]
        public async Task<ActionResult<int>> CreateOrder(CreateOrderDto orderDto)
        {
            var basket = await _context.Baskets
                                    .RetrieveBasketWithItems(User.Identity.Name)
                                    .FirstOrDefaultAsync();
            
            if(basket == null) return BadRequest(new ProblemDetails{Title="Could not locate basket"});

            var items = new List<OrderItem>();

            foreach (var item in basket.Items)
            {
                var productItem = await _context.Products.FindAsync(item.ProductId);

                var itemOrdered = new ProductItemOrdered
                {
                    ProductId = productItem.Id,
                    Name = productItem.Name,
                    PictureUrl = productItem.PictureUrl
                };

                var orderItem = new OrderItem
                {
                    ItemOrdered = itemOrdered,
                    Price = productItem.Price,
                    Quantity = item.Quantity
                };
                items.Add(orderItem);
                productItem.QuantityInStock -= item.Quantity;
            }

            var subtotal = items.Sum(item=>item.Price * item.Quantity);
            var deliveryFee = subtotal > 10000 ? 0 : 500;

            var order = new Order
            {
                OrderItems = items,
                BuyerId = User.Identity.Name,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = subtotal,
                DeliveryFee = deliveryFee,
                PaymentIntentId=basket.PaymentIntentId
            };

            _context.Orders.Add(order);

            _context.Baskets.Remove(basket);

            if(orderDto.SaveAddress)
            {
                var user =await _context.Users.Include(i=>i.Address).FirstOrDefaultAsync(i=>i.UserName == User.Identity.Name);

                var address = new Entities.UserAddress{
                    FullName = orderDto.ShippingAddress.FullName,
                    Address1 = orderDto.ShippingAddress.Address1,
                    Address2 = orderDto.ShippingAddress.Address2,
                    City = orderDto.ShippingAddress.City,
                    Country = orderDto.ShippingAddress.Country,
                    State = orderDto.ShippingAddress.State,
                    Zip = orderDto.ShippingAddress.Zip,
                };

                user.Address=address;
            }

            FixupEntities(_context);
            var results = await _context.SaveChangesAsync()>0;

            if(results) return CreatedAtRoute("GetOrder",new {id = order.Id},order.Id);

            return BadRequest("Problem creating order");
        }
        public void FixupEntities(DbContext context)
        {
            var dateProperties = context.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(DateTime))
                .Select(z => new
                {
                    ParentName = z.DeclaringEntityType.Name,
                    PropertyName = z.Name
                });

            var editedEntitiesInTheDbContextGraph = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified)
                .Select(x => x.Entity);

            foreach (var entity in editedEntitiesInTheDbContextGraph)
            {
                var entityFields = dateProperties.Where(d => d.ParentName == entity.GetType().FullName);

                foreach (var property in entityFields)
                {
                    var prop = entity.GetType().GetProperty(property.PropertyName);

                    if (prop == null)
                        continue;

                    var originalValue = prop.GetValue(entity) as DateTime?;
                    if (originalValue == null)
                        continue;

                    prop.SetValue(entity, DateTime.SpecifyKind(originalValue.Value, DateTimeKind.Utc));
                }
            }
        }
    }
}