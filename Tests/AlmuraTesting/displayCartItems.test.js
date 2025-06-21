import { displayCartItems } from '../src/cart';
import { render, screen } from '@testing-library/dom';

describe('displayCartItems', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="cart-items-container"></div>
      <div class="delivery-container"></div>
    `;
  });

  test('shows empty message for empty cart', () => {
    displayCartItems([]);
    expect(screen.getByText('Cart is empty')).toBeInTheDocument();
    expect(document.querySelector('.delivery-container').style.display).toBe('none');
  });

  test('renders cart items with correct data', () => {
    const testItems = [{
      id: 1,
      name: "Margherita Pizza",
      price: 12.99,
      image: "pizza.jpg",
      amount: 1,
      totalPrice: 12.99
    }];
    
    displayCartItems(testItems);
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Price: 12.99 ₽')).toBeInTheDocument();
    expect(document.querySelectorAll('.cart-item').length).toBe(1);
  });
});
