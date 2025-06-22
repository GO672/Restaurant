// Order Status value object to replace primitive obsession
class OrderStatus {
  static VALID_STATUSES = {
    IN_PROCESS: 'InProcess',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    PENDING: 'Pending'
  };

  constructor(status) {
    if (!Object.values(OrderStatus.VALID_STATUSES).includes(status)) {
      throw new Error(`Invalid order status: ${status}. Valid statuses are: ${Object.values(OrderStatus.VALID_STATUSES).join(', ')}`);
    }
    this._status = status;
  }

  // Get the status value
  getValue() {
    return this._status;
  }

  // Get display text for UI
  getDisplayText() {
    const displayMap = {
      [OrderStatus.VALID_STATUSES.IN_PROCESS]: 'In Process',
      [OrderStatus.VALID_STATUSES.DELIVERED]: 'Delivered',
      [OrderStatus.VALID_STATUSES.CANCELLED]: 'Cancelled',
      [OrderStatus.VALID_STATUSES.PENDING]: 'Pending'
    };
    return displayMap[this._status] || this._status;
  }

  // Check if status is in process
  isInProcess() {
    return this._status === OrderStatus.VALID_STATUSES.IN_PROCESS;
  }

  // Check if status is delivered
  isDelivered() {
    return this._status === OrderStatus.VALID_STATUSES.DELIVERED;
  }

  // Check if status is cancelled
  isCancelled() {
    return this._status === OrderStatus.VALID_STATUSES.CANCELLED;
  }

  // Check if status is pending
  isPending() {
    return this._status === OrderStatus.VALID_STATUSES.PENDING;
  }

  // Check if order can be confirmed (only in process orders)
  canBeConfirmed() {
    return this.isInProcess();
  }

  // Get next status after confirmation
  getNextStatusAfterConfirmation() {
    if (this.isInProcess()) {
      return new OrderStatus(OrderStatus.VALID_STATUSES.DELIVERED);
    }
    throw new Error(`Cannot confirm order with status: ${this._status}`);
  }

  // Compare with another status
  equals(otherStatus) {
    if (!(otherStatus instanceof OrderStatus)) {
      return false;
    }
    return this._status === otherStatus._status;
  }

  // Get status color for UI styling
  getStatusColor() {
    const colorMap = {
      [OrderStatus.VALID_STATUSES.IN_PROCESS]: '#ffa500', // Orange
      [OrderStatus.VALID_STATUSES.DELIVERED]: '#28a745',  // Green
      [OrderStatus.VALID_STATUSES.CANCELLED]: '#dc3545',  // Red
      [OrderStatus.VALID_STATUSES.PENDING]: '#17a2b8'    // Blue
    };
    return colorMap[this._status] || '#6c757d'; // Default gray
  }

  // Create from string with validation
  static fromString(statusString) {
    return new OrderStatus(statusString);
  }

  // Get all valid statuses
  static getAllStatuses() {
    return Object.values(OrderStatus.VALID_STATUSES);
  }
}

// Order Date value object to replace primitive obsession
class OrderDate {
  constructor(dateString) {
    if (!dateString) {
      throw new Error('Date string cannot be empty');
    }
    
    this._date = new Date(dateString);
    
    if (isNaN(this._date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
  }

  // Get the original date string
  getOriginalString() {
    return this._date.toISOString();
  }

  // Get formatted date for display
  getFormattedDate() {
    return this._date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get formatted time for display
  getFormattedTime() {
    return this._date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get formatted date and time for display
  getFormattedDateTime() {
    return `${this.getFormattedDate()} at ${this.getFormattedTime()}`;
  }

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime() {
    const now = new Date();
    const diffInMs = now.getTime() - this._date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Check if date is today
  isToday() {
    const today = new Date();
    return this._date.toDateString() === today.toDateString();
  }

  // Check if date is in the past
  isInPast() {
    return this._date < new Date();
  }

  // Check if date is in the future
  isInFuture() {
    return this._date > new Date();
  }

  // Get time difference in minutes
  getTimeDifferenceInMinutes() {
    const now = new Date();
    return Math.floor((now.getTime() - this._date.getTime()) / (1000 * 60));
  }

  // Compare with another date
  equals(otherDate) {
    if (!(otherDate instanceof OrderDate)) {
      return false;
    }
    return this._date.getTime() === otherDate._date.getTime();
  }

  // Check if this date is before another date
  isBefore(otherDate) {
    if (!(otherDate instanceof OrderDate)) {
      throw new Error('Can only compare with another OrderDate instance');
    }
    return this._date < otherDate._date;
  }

  // Check if this date is after another date
  isAfter(otherDate) {
    if (!(otherDate instanceof OrderDate)) {
      throw new Error('Can only compare with another OrderDate instance');
    }
    return this._date > otherDate._date;
  }

  // Create from string with validation
  static fromString(dateString) {
    return new OrderDate(dateString);
  }

  // Create from Date object
  static fromDate(date) {
    if (!(date instanceof Date)) {
      throw new Error('Input must be a Date object');
    }
    return new OrderDate(date.toISOString());
  }
}

// Helper function to create validated order objects
const createValidatedOrder = (rawOrder) => {
  try {
    return {
      id: rawOrder.id,
      orderTime: OrderDate.fromString(rawOrder.orderTime),
      deliveryTime: OrderDate.fromString(rawOrder.deliveryTime),
      status: OrderStatus.fromString(rawOrder.status),
      price: rawOrder.price
    };
  } catch (error) {
    console.error(`Invalid order data: ${error.message}`, rawOrder);
    throw error;
  }
};

// Order Display Service to handle order rendering and eliminate long method
class OrderDisplayService {
  constructor() {
    this.ordersContainer = document.getElementById('orders-container');
  }

  // Main method to display orders
  displayOrders(orders) {
    this.ordersContainer.innerHTML = ''; // Clear previous orders
    orders.forEach(order => this.createOrderElement(order));
  }

  // Create individual order element
  createOrderElement(order) {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order');

    // Create order components
    this.addOrderTime(orderElement, order);
    this.addOrderStatus(orderElement, order);
    this.addDeliveryTime(orderElement, order);
    this.addOrderPrice(orderElement, order);
    this.addConfirmButton(orderElement, order);

    // Append order element to container
    this.ordersContainer.appendChild(orderElement);
  }

  // Add order time with click functionality
  addOrderTime(orderElement, order) {
    const orderTime = document.createElement('div');
    orderTime.textContent = `Order Time: ${order.orderTime.getFormattedDateTime()}`;
    orderTime.classList.add('clickable');
    orderTime.addEventListener('click', () => {
      window.location.href = `/orderDetails/orderD.html?id=${order.id}`;
    });
    orderElement.appendChild(orderTime);
  }

  // Add order status with color coding
  addOrderStatus(orderElement, order) {
    const status = document.createElement('div');
    status.textContent = `Status: ${order.status.getDisplayText()}`;
    status.style.color = order.status.getStatusColor();
    orderElement.appendChild(status);
  }

  // Add delivery time with overdue indicators
  addDeliveryTime(orderElement, order) {
    const deliveryTime = document.createElement('div');
    deliveryTime.textContent = `Expected Delivery Time: ${order.deliveryTime.getFormattedDateTime()}`;
    
    // Add visual indicators for delivery status
    this.addDeliveryStatusIndicator(deliveryTime, order);
    
    orderElement.appendChild(deliveryTime);
  }

  // Add delivery status visual indicators
  addDeliveryStatusIndicator(deliveryTimeElement, order) {
    if (order.deliveryTime.isInPast() && !order.status.isDelivered()) {
      deliveryTimeElement.style.color = '#dc3545'; // Red for overdue
      deliveryTimeElement.textContent += ' (Overdue)';
    } else if (order.deliveryTime.isToday()) {
      deliveryTimeElement.style.color = '#ffa500'; // Orange for today
      deliveryTimeElement.textContent += ' (Today)';
    }
  }

  // Add order price
  addOrderPrice(orderElement, order) {
    const price = document.createElement('div');
    price.textContent = `Total Order Cost: ${order.price} ₽`;
    orderElement.appendChild(price);
  }

  // Add confirm button if order can be confirmed
  addConfirmButton(orderElement, order) {
    if (!order.status.canBeConfirmed()) return;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm Order';
    orderElement.classList.add('order-with-button');
    confirmButton.addEventListener('click', () => this.handleOrderConfirmation(order, confirmButton));
    orderElement.appendChild(confirmButton);
  }

  // Handle order confirmation
  async handleOrderConfirmation(order, confirmButton) {
    try {
      await this.confirmOrderAPI(order.id);
      
      // Update UI
      confirmButton.style.visibility = 'hidden';
      this.updateOrderStatus(order);
      this.showNotification('Order Confirmed successfully');
      
    } catch (error) {
      console.error('There was a problem confirming the order:', error);
    }
  }

  // API call to confirm order
  async confirmOrderAPI(orderId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in localStorage.');
    }

    const response = await fetch(`https://food-delivery.int.kreosoft.space/api/order/${orderId}/status`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: ''
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  }

  // Update order status after confirmation
  updateOrderStatus(order) {
    const newStatus = order.status.getNextStatusAfterConfirmation();
    order.status = newStatus;
    
    // Update status display
    const statusElement = order.element?.querySelector('div:nth-child(2)'); // Status is second child
    if (statusElement) {
      statusElement.textContent = `Status: ${newStatus.getDisplayText()}`;
      statusElement.style.color = newStatus.getStatusColor();
    }
  }

  // Show notification
  showNotification(message, duration = 1500) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    document.body.appendChild(notification);
  
    setTimeout(() => {
      notification.remove();
    }, duration);
  }
}

function closePopup() {
  // Hide the close button
  document.getElementById('close-popup').style.display = 'none';

  // Close the popup
  const popup = document.getElementById('popup-box');
  popup.style.display = 'none';
}
document.getElementById('close-popup').addEventListener('click', closePopup);

// Call fetchAndDisplayOrders function to fetch and display orders
fetchAndDisplayOrders();

document.getElementById('logout-link').addEventListener('click', function(event) {
  event.preventDefault(); // Prevent default action of the link

  // Retrieve the token from localStorage
  const token = localStorage.getItem('token');

  fetch('https://food-delivery.int.kreosoft.space/api/account/logout', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
  })
  .then(response => {
      if (response.ok) {            
          localStorage.removeItem('token');
          window.location.href = '/Login/login.html';
      } else {
          console.error('Logout failed');
      }
  })
  .catch(error => {
      console.error('Error during logout:', error);
  });
});

// profile icon dropdown
document.querySelector('.select-dropdown1').addEventListener('click', function() {
  const dropdownContent = this.querySelector('.dropdown-content');
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown content when clicking outside the dropdown
document.addEventListener('click', function(event) {
  const dropdowns = document.querySelectorAll('.select-dropdown1');
  dropdowns.forEach(function(dropdown) {
    if (!dropdown.contains(event.target)) {
      dropdown.querySelector('.dropdown-content').style.display = 'none';
    }
  });
});
