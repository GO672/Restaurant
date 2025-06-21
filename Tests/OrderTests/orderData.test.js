describe('Order Data Primitive Obsession', () => {
  test('status comparison uses magic string', () => {
    const orders = [{ status: "InProcess" }];
    displayOrders(orders);
    expect(document.querySelector('button')).toBeTruthy(); // Button exists because of "InProcess" string
  });

  test('order time displayed as raw string', () => {
    const orders = [{ orderTime: "2024-01-01T12:00:00Z", status: "Delivered" }];
    displayOrders(orders);
    expect(document.querySelector('.clickable').textContent)
      .toBe('Order Time: 2024-01-01T12:00:00Z'); // No formatting
  });
});
