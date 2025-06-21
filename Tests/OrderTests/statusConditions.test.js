describe('Order Status Conditional Complexity', () => {
  test('has nested status-dependent logic', () => {
    const orders = [
      { status: "InProcess" }, // Shows button
      { status: "Delivered" }  // No button
    ];
    displayOrders(orders);
    expect(document.querySelectorAll('button').length).toBe(1);
  });

  test('notification shows on status change', async () => {
    document.body.innerHTML = '<div id="orders-container"></div>';
    displayOrders([{ id: 1, status: "InProcess" }]);
    
    fetch.mockResolvedValue({ ok: true });
    await document.querySelector('button').click();
    
    expect(document.querySelector('.notification'))
      .toHaveTextContent('Order Confirmed successfully');
  });
});
