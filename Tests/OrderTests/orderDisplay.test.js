describe('displayOrders Long Method', () => {
  const mockOrders = [{
    id: 1,
    orderTime: "2024-01-01T12:00:00Z",
    status: "InProcess",
    deliveryTime: "2024-01-01T13:00:00Z",
    price: 25.99
  }];

  beforeEach(() => {
    document.body.innerHTML = '<div id="orders-container"></div>';
  });

  test('creates all required order elements', () => {
    displayOrders(mockOrders);
    const orderEl = document.querySelector('.order');
    expect(orderEl).toContainElement('.clickable');
    expect(orderEl).toHaveTextContent('Order Time:');
    expect(orderEl).toHaveTextContent('Status:');
    expect(orderEl).toHaveTextContent('Expected Delivery Time:');
    expect(orderEl).toHaveTextContent('Total Order Cost:');
  });

  test('adds confirm button for InProcess orders', () => {
    displayOrders(mockOrders);
    expect(document.querySelector('button')).toHaveTextContent('Confirm Order');
  });
});
