import { displayCartItems } from '../src/orderCart';

describe('Cart Rendering', () => {
  const testItem = {
    id: 1,
    name: "Pizza",
    price: 10,
    image: "pizza.jpg",
    amount: 2,
    totalPrice: 20
  };

  it('renders item name and price correctly', () => {
    displayCartItems([testItem]);
    expect(document.querySelector('.cart-item').textContent)
      .toContain('Pizza').toContain('10 ₽');
  });
});
