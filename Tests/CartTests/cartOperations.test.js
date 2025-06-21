import { addToCart, decreaseQuantity } from '../src/orderCart';

describe('Cart Operations', () => {
  beforeEach(() => {
    fetch.mockResolvedValue({ ok: true });
    localStorage.getItem.mockReturnValue('test-token');
  });

  test('addToCart sends POST request', async () => {
    await addToCart(123);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/basket/dish/123'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
