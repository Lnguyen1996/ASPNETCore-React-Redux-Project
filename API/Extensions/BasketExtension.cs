using System.Linq;
using API.DTOs;
using API.Entities;

namespace API.Extensions
{
    public static class BasketExtension
    {
        public static BasketDto MapBasketToDto(this Basket basket)
        {
          return new BasketDto
            {
                BuyerId = basket.BuyerId,
                Id = basket.Id,
                Items = basket.Items.Select(i => new BasketItemDto
                {
                    ProductId = i.ProductId,
                    Name = i.Product.Name,
                    Brand = i.Product.Brand,
                    PictureUrl = i.Product.PictureUrl,
                    Price = i.Product.Price,
                    Quantity = i.Quantity,
                    Type = i.Product.Type
                }).ToList()
            };
        }
    }
}