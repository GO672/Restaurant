describe('Dish Info Tests', () => {
  let dish;

  beforeEach(() => {
    dish = {
      id: 1,
      name: 'Pizza',
      description: 'Delicious cheese pizza',
      price: 100,
      rating: 4.5
    };
  });

  test('should display dish name', () => {
    expect(dish.name).toBe('Pizza');
  });

  test('should display dish price', () => {
    expect(dish.price).toBe(100);
  });

  test('should add dish to cart', () => {
    const cart = [];
    cart.push(dish);
    expect(cart.length).toBe(1);
    expect(cart[0].name).toBe('Pizza');
  });
}); 