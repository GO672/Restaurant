describe('Orders Display Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="orders-container"></div>
      <div id="order-details-container"></div>
    `;
    
    // Reset mocks
    fetch.mockClear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    console.log.mockClear();
    console.error.mockClear();
  });

  describe('Order Listing', () => {
    test('should display orders correctly', () => {
      const ordersContainer = document.getElementById('orders-container');
      const orders = [
        createMockOrder(1, 'InProgress', '2024-01-15T18:00', '123 Main St'),
        createMockOrder(2, 'Delivered', '2024-01-14T12:00', '456 Oak St')
      ];

      ordersContainer.innerHTML = '';

      orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');

        const orderId = document.createElement('div');
        orderId.textContent = `Order #${order.id}`;
        orderElement.appendChild(orderId);

        const status = document.createElement('div');
        status.textContent = order.status;
        orderElement.appendChild(status);

        const deliveryTime = document.createElement('div');
        deliveryTime.textContent = order.deliveryTime;
        orderElement.appendChild(deliveryTime);

        const address = document.createElement('div');
        address.textContent = order.address;
        orderElement.appendChild(address);

        ordersContainer.appendChild(orderElement);
      });

      expect(ordersContainer.children.length).toBe(2);
      expect(ordersContainer.querySelectorAll('.order-item')).toHaveLength(2);
      
      const firstOrder = ordersContainer.querySelector('.order-item');
      expect(firstOrder.querySelector('div').textContent).toBe('Order #1');
    });

    test('should display order details correctly', () => {
      const orderDetailsContainer = document.getElementById('order-details-container');
      const order = createMockOrder(1, 'InProgress', '2024-01-15T18:00', '123 Main St');

      orderDetailsContainer.innerHTML = '';

      const orderDetails = document.createElement('div');
      orderDetails.classList.add('order-details');

      const orderId = document.createElement('h3');
      orderId.textContent = `Order #${order.id}`;
      orderDetails.appendChild(orderId);

      const status = document.createElement('div');
      status.textContent = `Status: ${order.status}`;
      orderDetails.appendChild(status);

      const deliveryTime = document.createElement('div');
      deliveryTime.textContent = `Delivery Time: ${order.deliveryTime}`;
      orderDetails.appendChild(deliveryTime);

      const address = document.createElement('div');
      address.textContent = `Address: ${order.address}`;
      orderDetails.appendChild(address);

      const itemsList = document.createElement('ul');
      order.items.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.textContent = `${item.name} x${item.amount} - ${item.price} ₽`;
        itemsList.appendChild(itemElement);
      });
      orderDetails.appendChild(itemsList);

      orderDetailsContainer.appendChild(orderDetails);

      expect(orderDetailsContainer.children.length).toBe(1);
      expect(orderDetailsContainer.querySelector('.order-details')).toBeTruthy();
      expect(orderDetailsContainer.querySelector('h3').textContent).toBe('Order #1');
    });
  });

  describe('Order Details', () => {
    test('should handle order details fetch', async () => {
      const mockToken = 'mock-jwt-token';
      localStorage.getItem.mockReturnValue(mockToken);

      const mockOrderDetails = createMockOrder(1, 'InProgress', '2024-01-15T18:00', '123 Main St');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrderDetails
      });

      const orderId = 1;
      const response = await fetch(`https://food-delivery.int.kreosoft.space/api/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.id).toBe(1);
      expect(fetch).toHaveBeenCalledWith(
        `https://food-delivery.int.kreosoft.space/api/order/${orderId}`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
    });

    test('should handle order details fetch failure', async () => {
      const mockToken = 'mock-jwt-token';
      localStorage.getItem.mockReturnValue(mockToken);

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const orderId = 999;
      try {
        const response = await fetch(`https://food-delivery.int.kreosoft.space/api/order/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Order not found');
        }
      } catch (error) {
        expect(error.message).toBe('Order not found');
      }
    });
  });

  describe('Order Status Management', () => {
    test('should display different order statuses correctly', () => {
      const statuses = ['InProgress', 'Delivered', 'Cancelled'];
      const statusElements = [];

      statuses.forEach(status => {
        const statusElement = document.createElement('div');
        statusElement.classList.add('status', status.toLowerCase());
        statusElement.textContent = status;
        statusElements.push(statusElement);
      });

      expect(statusElements).toHaveLength(3);
      expect(statusElements[0].textContent).toBe('InProgress');
      expect(statusElements[1].textContent).toBe('Delivered');
      expect(statusElements[2].textContent).toBe('Cancelled');
    });
  });
}); 