describe('Order Status Feature Envy', () => {
  test('UI knows too much about status values', () => {
    const orders = [{ status: "InProcess" }];
    displayOrders(orders);
    const button = document.querySelector('button');
    
    // UI directly knows about status transitions
    button.click();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/status'),
      expect.anything()
    );
  });
});
