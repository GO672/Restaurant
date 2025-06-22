// Centralized Notification Service to eliminate feature envy
class NotificationService {
  constructor() {
    this.defaultDuration = 1500;
    this.notificationContainer = null;
    this.initializeContainer();
  }

  // Initialize notification container
  initializeContainer() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'notification-container';
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.notificationContainer);
  }

  // Show notification with consistent styling
  show(message, type = 'info', duration = null) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Apply consistent styling
    notification.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideInRight 0.3s ease-out;
      pointer-events: auto;
    `;

    this.notificationContainer.appendChild(notification);

    const displayDuration = duration || this.defaultDuration;
    
    setTimeout(() => {
      this.removeNotification(notification);
    }, displayDuration);

    return notification;
  }

  // Show success notification
  showSuccess(message, duration = null) {
    return this.show(message, 'success', duration);
  }

  // Show error notification
  showError(message, duration = null) {
    return this.show(message, 'error', duration);
  }

  // Show warning notification
  showWarning(message, duration = null) {
    return this.show(message, 'warning', duration);
  }

  // Show info notification
  showInfo(message, duration = null) {
    return this.show(message, 'info', duration);
  }

  // Remove notification with animation
  removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  // Get background color based on notification type
  getBackgroundColor(type) {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    return colors[type] || colors.info;
  }

  // Clear all notifications
  clearAll() {
    if (this.notificationContainer) {
      this.notificationContainer.innerHTML = '';
    }
  }
}

// Global notification service instance
const notificationService = new NotificationService();

// Base API Service to unify interfaces and eliminate alternative classes
class BaseApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Get common headers for authenticated requests
  getAuthHeaders() {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Get common headers for JSON requests
  getJsonHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Get authenticated JSON headers
  getAuthJsonHeaders() {
    return {
      ...this.getJsonHeaders(),
      ...this.getAuthHeaders()
    };
  }

  // Generic GET request
  async get(endpoint, headers = null) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: headers || this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`GET request failed: ${response.status}`);
    }

    return response.json();
  }

  // Generic POST request
  async post(endpoint, data = null, headers = null) {
    const options = {
      method: 'POST',
      headers: headers || this.getAuthJsonHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`POST request failed: ${response.status}`);
    }

    return response.json();
  }

  // Generic PUT request
  async put(endpoint, data = null, headers = null) {
    const options = {
      method: 'PUT',
      headers: headers || this.getAuthJsonHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`PUT request failed: ${response.status}`);
    }

    return response.json();
  }

  // Generic DELETE request
  async delete(endpoint, headers = null) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: headers || this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`DELETE request failed: ${response.status}`);
    }

    return response;
  }
}

// Order API Service extending base API service
class OrderApiService extends BaseApiService {
  constructor() {
    super('https://food-delivery.int.kreosoft.space/api');
  }

  // Get order details by ID
  async getOrderDetails(orderId) {
    try {
      return await this.get(`/order/${orderId}`);
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Confirm order delivery
  async confirmOrder(orderId) {
    try {
      await this.post(`/order/${orderId}/status`, '', {
        'accept': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });
      return true;
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }
}

// Order State Manager to eliminate temporal coupling
class OrderStateManager {
  constructor() {
    this.currentOrder = null;
    this.confirmButton = null;
    this.isProcessing = false;
  }

  // Set current order using rich domain model
  setOrder(orderData) {
    this.currentOrder = Order.fromData(orderData);
  }

  // Get current order
  getOrder() {
    return this.currentOrder;
  }

  // Get current order status
  getOrderStatus() {
    return this.currentOrder ? this.currentOrder.status : null;
  }

  // Set confirm button reference
  setConfirmButton(button) {
    this.confirmButton = button;
  }

  // Get confirm button
  getConfirmButton() {
    return this.confirmButton;
  }

  // Check if order can be confirmed using domain logic
  canConfirmOrder() {
    return this.currentOrder && this.currentOrder.canBeConfirmed();
  }

  // Update order status using domain logic
  updateOrderStatus(newStatus) {
    if (this.currentOrder) {
      this.currentOrder._status = OrderStatus.fromString(newStatus);
    }
  }

  // Set processing state
  setProcessing(isProcessing) {
    this.isProcessing = isProcessing;
  }

  // Check if currently processing
  isCurrentlyProcessing() {
    return this.isProcessing;
  }

  // Validate order state using domain validation
  validateOrderState() {
    if (!this.currentOrder) {
      throw new Error('No order loaded');
    }
    if (!this.currentOrder.isValid()) {
      throw new Error('Invalid order data');
    }
    if (this.isProcessing) {
      throw new Error('Order operation already in progress');
    }
  }

  // Reset state
  reset() {
    this.currentOrder = null;
    this.confirmButton = null;
    this.isProcessing = false;
  }
}

// Order Confirmation Service to handle confirmation logic
class OrderConfirmationService {
  constructor(apiService, uiService, stateManager) {
    this.apiService = apiService;
    this.uiService = uiService;
    this.stateManager = stateManager;
  }

  // Confirm order with proper state management using domain logic
  async confirmOrder() {
    // Validate state before proceeding
    this.stateManager.validateOrderState();
    
    // Set processing state
    this.stateManager.setProcessing(true);
    
    try {
      // Disable UI immediately to prevent double-clicks
      this.disableConfirmationUI();
      
      // Perform API call
      await this.apiService.confirmOrder(this.stateManager.getOrder().id);
      
      // Update order domain object using business logic
      this.stateManager.getOrder().confirmDelivery();
      
      // Update UI
      this.updateUIAfterConfirmation();
      
      // Show success notification
      this.uiService.showNotification('Order Confirmed successfully');
      
    } catch (error) {
      console.error('Failed to confirm order:', error);
      this.uiService.showErrorNotification('Failed to confirm order', 3000);
      
      // Re-enable UI on error
      this.enableConfirmationUI();
    } finally {
      // Reset processing state
      this.stateManager.setProcessing(false);
    }
  }

  // Disable confirmation UI
  disableConfirmationUI() {
    const confirmButton = this.stateManager.getConfirmButton();
    if (confirmButton) {
      this.uiService.hideConfirmButton(confirmButton);
    }
  }

  // Enable confirmation UI (for error cases)
  enableConfirmationUI() {
    const confirmButton = this.stateManager.getConfirmButton();
    if (confirmButton) {
      this.uiService.showConfirmButton(confirmButton);
    }
  }

  // Update UI after successful confirmation using domain methods
  updateUIAfterConfirmation() {
    const order = this.stateManager.getOrder();
    if (order) {
      // Update order status display using domain display name
      this.uiService.updateOrderStatus(order.status.getDisplayName());
    }
  }
}

// Order UI Service to handle DOM manipulations using rich domain model
class OrderUIService {
  constructor() {
    this.notificationService = notificationService;
  }

  // Update order details in the DOM using rich domain model
  updateOrderDetails(order) {
    // Update basic order information using domain methods
    this.updateElement('order-time', `Order Time: ${order.getFormattedOrderTime()}`);
    this.updateElement('order-status', `Status: ${order.status.getDisplayName()}`);
    this.updateElement('expected-delivery-time', `Expected Delivery Time: ${order.deliveryInfo.getFormattedExpectedTime()}`);
    this.updateElement('total-order-cost', `Total Order Cost: ${order.getFormattedTotalPrice()}`);
    this.updateElement('address', `Address: ${order.deliveryInfo.address}`);

    // Update dishes list using domain objects
    this.updateDishesList(order.items);
  }

  // Update order status display
  updateOrderStatus(statusDisplayName) {
    this.updateElement('order-status', `Status: ${statusDisplayName}`);
  }

  // Update a single element
  updateElement(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  // Update dishes list using rich domain objects
  updateDishesList(orderItems) {
    const dishesList = document.getElementById('dishes-list');
    if (!dishesList) return;

    dishesList.innerHTML = orderItems.map(item => `
      <li style="display: flex; align-items: center;">
        <img src="${item.image}" alt="${item.name}">
        <span style="margin-left: 10px;">
          ${item.name} <div class="repo"> ${item.amount} x ${item.getFormattedPrice()} </div>  <div class="a7aa"> Total Price ${item.getFormattedTotalPrice()}</div>
        </span>
      </li>
    `).join('');
  }

  // Create confirm order button
  createConfirmButton(orderId, onConfirm) {
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm Order';
    confirmButton.addEventListener('click', onConfirm);
    document.body.appendChild(confirmButton);
    return confirmButton;
  }

  // Hide confirm button
  hideConfirmButton(button) {
    if (button) {
      button.style.visibility = 'hidden';
    }
  }

  // Show confirm button
  showConfirmButton(button) {
    if (button) {
      button.style.visibility = 'visible';
    }
  }

  // Show notification using centralized service
  showNotification(message, duration = null) {
    return this.notificationService.showSuccess(message, duration);
  }

  // Show error notification
  showErrorNotification(message, duration = null) {
    return this.notificationService.showError(message, duration);
  }
}

// Rich Domain Model - Order Item with business logic
class OrderItem {
  constructor(id, name, price, amount, image, description = '') {
    this._id = id;
    this._name = name;
    this._price = price;
    this._amount = amount;
    this._image = image;
    this._description = description;
  }

  // Getters
  get id() { return this._id; }
  get name() { return this._name; }
  get price() { return this._price; }
  get amount() { return this._amount; }
  get image() { return this._image; }
  get description() { return this._description; }

  // Business logic methods
  getTotalPrice() {
    return this._price * this._amount;
  }

  getFormattedPrice() {
    return `${this._price} ₽`;
  }

  getFormattedTotalPrice() {
    return `${this.getTotalPrice()} ₽`;
  }

  getDisplayText() {
    return `${this._name} - ${this._amount} x ${this.getFormattedPrice()}`;
  }

  // Validation
  isValid() {
    return this._id && this._name && this._price > 0 && this._amount > 0;
  }

  // Factory method
  static fromData(data) {
    return new OrderItem(
      data.id,
      data.name,
      data.price,
      data.amount,
      data.image,
      data.description
    );
  }
}

// Rich Domain Model - Delivery Information with business logic
class DeliveryInfo {
  constructor(address, deliveryTime, expectedDeliveryTime) {
    this._address = address;
    this._deliveryTime = new Date(deliveryTime);
    this._expectedDeliveryTime = new Date(expectedDeliveryTime);
  }

  // Getters
  get address() { return this._address; }
  get deliveryTime() { return this._deliveryTime; }
  get expectedDeliveryTime() { return this._expectedDeliveryTime; }

  // Business logic methods
  isDelivered() {
    return this._deliveryTime <= new Date();
  }

  isOverdue() {
    return !this.isDelivered() && this._expectedDeliveryTime < new Date();
  }

  getDeliveryStatus() {
    if (this.isDelivered()) {
      return 'Delivered';
    } else if (this.isOverdue()) {
      return 'Overdue';
    } else {
      return 'On Time';
    }
  }

  getFormattedDeliveryTime() {
    return this._deliveryTime.toLocaleString();
  }

  getFormattedExpectedTime() {
    return this._expectedDeliveryTime.toLocaleString();
  }

  getTimeUntilDelivery() {
    const now = new Date();
    const diff = this._expectedDeliveryTime - now;
    if (diff <= 0) return 'Past due';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  // Validation
  isValid() {
    return this._address && this._address.trim().length > 0 &&
           this._deliveryTime instanceof Date && !isNaN(this._deliveryTime) &&
           this._expectedDeliveryTime instanceof Date && !isNaN(this._expectedDeliveryTime);
  }

  // Factory method
  static fromData(data) {
    return new DeliveryInfo(
      data.address,
      data.deliveryTime,
      data.expectedDeliveryTime
    );
  }
}

// Rich Domain Model - Order with business logic
class Order {
  constructor(id, items, deliveryInfo, status, totalPrice, orderTime) {
    this._id = id;
    this._items = items.map(item => OrderItem.fromData(item));
    this._deliveryInfo = DeliveryInfo.fromData(deliveryInfo);
    this._status = OrderStatus.fromString(status);
    this._totalPrice = totalPrice;
    this._orderTime = new Date(orderTime);
  }

  // Getters
  get id() { return this._id; }
  get items() { return [...this._items]; } // Return copy to prevent external modification
  get deliveryInfo() { return this._deliveryInfo; }
  get status() { return this._status; }
  get totalPrice() { return this._totalPrice; }
  get orderTime() { return this._orderTime; }

  // Business logic methods
  getItemCount() {
    return this._items.reduce((total, item) => total + item.amount, 0);
  }

  getUniqueItemCount() {
    return this._items.length;
  }

  getFormattedTotalPrice() {
    return `${this._totalPrice} ₽`;
  }

  getFormattedOrderTime() {
    return this._orderTime.toLocaleString();
  }

  canBeConfirmed() {
    return this._status.canBeConfirmed();
  }

  canBeCancelled() {
    return this._status.getValue() === OrderStatus.VALID_STATUSES.PENDING ||
           this._status.getValue() === OrderStatus.VALID_STATUSES.IN_PROCESS;
  }

  isDelivered() {
    return this._status.isDelivered();
  }

  isOverdue() {
    return this._deliveryInfo.isOverdue();
  }

  getDeliveryStatus() {
    return this._deliveryInfo.getDeliveryStatus();
  }

  getOrderSummary() {
    return {
      id: this._id,
      itemCount: this.getItemCount(),
      uniqueItems: this.getUniqueItemCount(),
      totalPrice: this.getFormattedTotalPrice(),
      status: this._status.getValue(),
      deliveryStatus: this.getDeliveryStatus(),
      orderTime: this.getFormattedOrderTime()
    };
  }

  // Business operations
  confirmDelivery() {
    if (!this.canBeConfirmed()) {
      throw new Error('Order cannot be confirmed in its current status');
    }
    this._status = OrderStatus.fromString(OrderStatus.VALID_STATUSES.DELIVERED);
  }

  cancelOrder() {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled in its current status');
    }
    this._status = OrderStatus.fromString(OrderStatus.VALID_STATUSES.CANCELLED);
  }

  // Validation
  isValid() {
    return this._id && 
           this._items.length > 0 && 
           this._items.every(item => item.isValid()) &&
           this._deliveryInfo.isValid() &&
           this._status &&
           this._totalPrice > 0 &&
           this._orderTime instanceof Date && !isNaN(this._orderTime);
  }

  // Factory method
  static fromData(data) {
    return new Order(
      data.id,
      data.dishes || data.items || [],
      {
        address: data.address,
        deliveryTime: data.deliveryTime,
        expectedDeliveryTime: data.expectedDeliveryTime || data.deliveryTime
      },
      data.status,
      data.price || data.totalPrice,
      data.orderTime
    );
  }
}

// Enhanced Order Status with more business logic
class OrderStatus {
  static VALID_STATUSES = {
    IN_PROCESS: 'InProcess',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    PENDING: 'Pending'
  };

  constructor(status) {
    if (!Object.values(OrderStatus.VALID_STATUSES).includes(status)) {
      throw new Error(`Invalid order status: ${status}`);
    }
    this._status = status;
  }

  getValue() {
    return this._status;
  }

  isInProcess() {
    return this._status === OrderStatus.VALID_STATUSES.IN_PROCESS;
  }

  isDelivered() {
    return this._status === OrderStatus.VALID_STATUSES.DELIVERED;
  }

  isCancelled() {
    return this._status === OrderStatus.VALID_STATUSES.CANCELLED;
  }

  isPending() {
    return this._status === OrderStatus.VALID_STATUSES.PENDING;
  }

  canBeConfirmed() {
    return this.isInProcess();
  }

  canBeCancelled() {
    return this.isPending() || this.isInProcess();
  }

  getDisplayName() {
    const displayNames = {
      [OrderStatus.VALID_STATUSES.IN_PROCESS]: 'In Process',
      [OrderStatus.VALID_STATUSES.DELIVERED]: 'Delivered',
      [OrderStatus.VALID_STATUSES.CANCELLED]: 'Cancelled',
      [OrderStatus.VALID_STATUSES.PENDING]: 'Pending'
    };
    return displayNames[this._status] || this._status;
  }

  getStatusColor() {
    const colors = {
      [OrderStatus.VALID_STATUSES.IN_PROCESS]: 'blue',
      [OrderStatus.VALID_STATUSES.DELIVERED]: 'green',
      [OrderStatus.VALID_STATUSES.CANCELLED]: 'red',
      [OrderStatus.VALID_STATUSES.PENDING]: 'orange'
    };
    return colors[this._status] || 'gray';
  }

  static fromString(statusString) {
    return new OrderStatus(statusString);
  }
}

// Order Details Controller to orchestrate order operations
class OrderDetailsController {
  constructor() {
    this.apiService = new OrderApiService();
    this.uiService = new OrderUIService();
    this.stateManager = new OrderStateManager();
    this.confirmationService = new OrderConfirmationService(
      this.apiService, 
      this.uiService, 
      this.stateManager
    );
    this.urlParams = new URLParams();
    this.orderId = this.urlParams.getString('id');
    this.init();
  }

  // Initialize the order details page
  async init() {
    if (!this.apiService.isAuthenticated()) {
      console.error('User not authenticated');
      return;
    }

    if (!this.orderId) {
      console.error('No order ID provided');
      return;
    }

    try {
      await this.loadOrderDetails();
    } catch (error) {
      console.error('Failed to load order details:', error);
    }
  }

  // Load order details
  async loadOrderDetails() {
    const orderDetails = await this.apiService.getOrderDetails(this.orderId);
    
    // Set order in state manager
    this.stateManager.setOrder(orderDetails);
    
    // Update UI with order details
    this.uiService.updateOrderDetails(orderDetails);
    
    // Setup confirm button if order can be confirmed
    if (this.stateManager.canConfirmOrder()) {
      this.setupConfirmButton();
    }
  }

  // Setup confirm order button
  setupConfirmButton() {
    const confirmButton = this.uiService.createConfirmButton(
      this.stateManager.getOrder().id,
      () => this.handleOrderConfirmation()
    );
    
    // Store button reference in state manager
    this.stateManager.setConfirmButton(confirmButton);
  }

  // Handle order confirmation
  async handleOrderConfirmation() {
    // Check if already processing
    if (this.stateManager.isCurrentlyProcessing()) {
      console.warn('Order confirmation already in progress');
      return;
    }
    
    // Delegate to confirmation service
    await this.confirmationService.confirmOrder();
  }
}

// URLParams value object to encapsulate URL parameter parsing and access
class URLParams {
  constructor(url = window.location.href) {
    this.url = url;
    this.params = new URLSearchParams((new URL(url)).search);
  }

  // Get a parameter as a string (null if not present)
  getString(name) {
    const value = this.params.get(name);
    return value !== null ? value : null;
  }

  // Get a parameter as an integer (null if not present or invalid)
  getInt(name) {
    const value = this.getString(name);
    if (value === null) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // Get a parameter as a boolean (false if not present)
  getBool(name) {
    const value = this.getString(name);
    return value === 'true';
  }

  // Get all values for a parameter (for arrays)
  getAll(name) {
    return this.params.getAll(name);
  }
}

// Initialize order details controller when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  new OrderDetailsController();
});
