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

// Function to fetch and display orders
const fetchAndDisplayOrders = async () => {
  // Retrieve token from local storage
  const token = localStorage.getItem('token');

  // Make sure token exists
  if (!token) {
    console.error('No token found in local storage.');
    return;
  }

  try {
    // Make GET request to fetch orders
    const response = await fetch('https://food-delivery.int.kreosoft.space/api/order', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Server responded with status ${response.status}: ${errorMessage}`);
    }

    // Parse response JSON
    const rawOrders = await response.json();

    if (rawOrders.length === 0) {
      // If there are no orders, display a message and hide the h1 element
      document.getElementById('orders-container').innerHTML = '<h5>No orders yet...)</h5>';
      document.querySelector('h1').style.display = 'none';
      return;
    }

    // Validate and create order objects
    const validatedOrders = rawOrders.map(rawOrder => {
      try {
        return createValidatedOrder(rawOrder);
      } catch (error) {
        console.error(`Skipping invalid order: ${error.message}`);
        return null;
      }
    }).filter(order => order !== null); // Remove invalid orders

    if (validatedOrders.length === 0) {
      document.getElementById('orders-container').innerHTML = '<h5>No valid orders found...</h5>';
      document.querySelector('h1').style.display = 'none';
      return;
    }

    // Display orders on the page
    displayOrders(validatedOrders);
  } catch (error) {
    console.error('There was a problem fetching orders:', error);
  }
};

// Function to display orders on the page
const displayOrders = (orders) => {
  const ordersContainer = document.getElementById('orders-container');
  ordersContainer.innerHTML = ''; // Clear previous orders

  orders.forEach(order => {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order');

    // Order objects now already contain OrderDate and OrderStatus instances
    const orderDate = order.orderTime;
    const deliveryDate = order.deliveryTime;
    const orderStatus = order.status;

    const orderTime = document.createElement('div');
    orderTime.textContent = `Order Time: ${orderDate.getFormattedDateTime()}`;
    orderTime.classList.add('clickable'); // Add a class for styling and targeting
    orderElement.appendChild(orderTime);

    orderTime.addEventListener('click', async () => {
      window.location.href = `/orderDetails/orderD.html?id=${order.id}`;
    });

    const status = document.createElement('div');
    status.textContent = `Status: ${orderStatus.getDisplayText()}`;
    status.style.color = orderStatus.getStatusColor(); // Apply status color
    orderElement.appendChild(status);

    const showNotification = (message, duration = 1500) => {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.classList.add('notification');
      document.body.appendChild(notification);
    
      setTimeout(() => {
        notification.remove();
      }, duration);
    };

    // Check if status can be confirmed using the value object
    if (orderStatus.canBeConfirmed()) {
      const confirmButton = document.createElement('button');
      confirmButton.textContent = 'Confirm Order';
      orderElement.classList.add('order-with-button');
      confirmButton.addEventListener('click', async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found in localStorage.');
            return;
          }

          const response = await fetch(`https://food-delivery.int.kreosoft.space/api/order/${order.id}/status`, {
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
          
          confirmButton.style.visibility = 'hidden';
          
          // Update status using the value object
          const newStatus = orderStatus.getNextStatusAfterConfirmation();
          order.status = newStatus; // Update the order object with new status
          
          // Update display
          status.textContent = `Status: ${newStatus.getDisplayText()}`;
          status.style.color = newStatus.getStatusColor();
          
          showNotification('Order Confirmed successfully');
          
        } catch (error) {
          console.error('There was a problem confirming the order:', error);
        }
      });
      orderElement.appendChild(confirmButton);
    }

    // Delivery Time with proper formatting
    const deliveryTime = document.createElement('div');
    deliveryTime.textContent = `Expected Delivery Time: ${deliveryDate.getFormattedDateTime()}`;
    
    // Add visual indicator if delivery is overdue
    if (deliveryDate.isInPast() && !orderStatus.isDelivered()) {
      deliveryTime.style.color = '#dc3545'; // Red for overdue
      deliveryTime.textContent += ' (Overdue)';
    } else if (deliveryDate.isToday()) {
      deliveryTime.style.color = '#ffa500'; // Orange for today
      deliveryTime.textContent += ' (Today)';
    }
    
    orderElement.appendChild(deliveryTime);

    // Price
    const price = document.createElement('div');
    price.textContent = `Total Order Cost: ${order.price} ₽`;
    orderElement.appendChild(price);

    // Append order element to container
    ordersContainer.appendChild(orderElement);
  });
};


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

// Utility functions that demonstrate the benefits of value objects

// Filter orders by status
const filterOrdersByStatus = (orders, targetStatus) => {
  const statusToFilter = OrderStatus.fromString(targetStatus);
  return orders.filter(order => order.status.equals(statusToFilter));
};

// Filter orders by date range
const filterOrdersByDateRange = (orders, startDate, endDate) => {
  const start = OrderDate.fromString(startDate);
  const end = OrderDate.fromString(endDate);
  
  return orders.filter(order => {
    const orderDate = order.orderTime;
    return orderDate.isAfter(start) && orderDate.isBefore(end);
  });
};

// Get overdue orders
const getOverdueOrders = (orders) => {
  return orders.filter(order => {
    return order.deliveryTime.isInPast() && !order.status.isDelivered();
  });
};

// Get orders that need attention (in process and overdue)
const getOrdersNeedingAttention = (orders) => {
  return orders.filter(order => {
    return order.status.isInProcess() && order.deliveryTime.isInPast();
  });
};

// Sort orders by delivery time
const sortOrdersByDeliveryTime = (orders, ascending = true) => {
  return [...orders].sort((a, b) => {
    if (ascending) {
      return a.deliveryTime.isBefore(b.deliveryTime) ? -1 : 1;
    } else {
      return a.deliveryTime.isAfter(b.deliveryTime) ? -1 : 1;
    }
  });
};

// Get order statistics
const getOrderStatistics = (orders) => {
  const stats = {
    total: orders.length,
    byStatus: {},
    overdue: 0,
    today: 0,
    thisWeek: 0
  };

  // Count by status
  OrderStatus.getAllStatuses().forEach(statusValue => {
    const status = OrderStatus.fromString(statusValue);
    stats.byStatus[status.getDisplayText()] = 0;
  });

  orders.forEach(order => {
    // Count by status
    const statusKey = order.status.getDisplayText();
    stats.byStatus[statusKey] = (stats.byStatus[statusKey] || 0) + 1;

    // Count overdue
    if (order.deliveryTime.isInPast() && !order.status.isDelivered()) {
      stats.overdue++;
    }

    // Count today's deliveries
    if (order.deliveryTime.isToday()) {
      stats.today++;
    }

    // Count this week's deliveries (within 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoDate = OrderDate.fromDate(weekAgo);
    if (order.deliveryTime.isAfter(weekAgoDate)) {
      stats.thisWeek++;
    }
  });

  return stats;
};

// Function to fetch and display orders
