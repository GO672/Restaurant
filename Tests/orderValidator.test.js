import { validateOrder } from '../src/order';

describe('Order Validation', () => {
  test('rejects invalid ISO dates', () => {
    expect(() => validateOrder({
      deliveryTime: "Tomorrow at 5PM",
      address: "123 Main St"
    })).toThrow('Invalid ISO 8601 format');
  });

  test('accepts valid order data', () => {
    const validOrder = {
      deliveryTime: "2024-06-10T19:00:00Z",
      address: "123 Main St"
    };
    expect(() => validateOrder(validOrder)).not.toThrow();
  });
});
