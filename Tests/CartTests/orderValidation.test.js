describe('Order Data Primitive Obsession Tests', () => {
  test('rejects invalid delivery time format', () => {
    const invalidOrder = {
      deliveryTime: "tomorrow at 5pm", // Should be ISO8601
      address: "123 Main St"
    };
    expect(() => validateOrder(invalidOrder))
      .toThrow('Invalid date format');
  });

  test('rejects empty address', () => {
    const invalidOrder = {
      deliveryTime: "2024-06-10T19:00:00Z",
      address: ""
    };
    expect(() => validateOrder(invalidOrder))
      .toThrow('Address required');
  });
});
