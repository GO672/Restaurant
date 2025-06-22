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

// Order API Service to centralize API operations and eliminate data clumps
class OrderApiService {
  constructor() {
    this.baseUrl = 'https://food-delivery.int.kreosoft.space/api';
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
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get order details by ID
  async getOrderDetails(orderId) {
    try {
      const response = await fetch(`${this.baseUrl}/order/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Confirm order delivery
  async confirmOrder(orderId) {
    try {
      const response = await fetch(`${this.baseUrl}/order/${orderId}/status`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: ''
      });

      if (!response.ok) {
        throw new Error('Failed to confirm order');
      }

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
    this.orderStatus = null;
    this.confirmButton = null;
    this.isProcessing = false;
  }

  // Set current order
  setOrder(orderDetails) {
    this.currentOrder = orderDetails;
    this.orderStatus = OrderStatus.fromString(orderDetails.status);
  }

  // Get current order
  getOrder() {
    return this.currentOrder;
  }

  // Get current order status
  getOrderStatus() {
    return this.orderStatus;
  }

  // Set confirm button reference
  setConfirmButton(button) {
    this.confirmButton = button;
  }

  // Get confirm button
  getConfirmButton() {
    return this.confirmButton;
  }

  // Check if order can be confirmed
  canConfirmOrder() {
    return this.orderStatus && this.orderStatus.canBeConfirmed();
  }

  // Update order status
  updateOrderStatus(newStatus) {
    if (this.currentOrder) {
      this.currentOrder.status = newStatus;
      this.orderStatus = OrderStatus.fromString(newStatus);
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

  // Validate order state
  validateOrderState() {
    if (!this.currentOrder) {
      throw new Error('No order loaded');
    }
    if (!this.orderStatus) {
      throw new Error('Invalid order status');
    }
    if (this.isProcessing) {
      throw new Error('Order operation already in progress');
    }
  }

  // Reset state
  reset() {
    this.currentOrder = null;
    this.orderStatus = null;
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

  // Confirm order with proper state management
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
      
      // Update state
      this.stateManager.updateOrderStatus(OrderStatus.VALID_STATUSES.DELIVERED);
      
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

  // Update UI after successful confirmation
  updateUIAfterConfirmation() {
    const order = this.stateManager.getOrder();
    if (order) {
      // Update order status display
      this.uiService.updateOrderStatus(order.status);
    }
  }
}

// Order UI Service to handle DOM manipulations
class OrderUIService {
  constructor() {
    this.notificationService = notificationService;
  }

  // Update order details in the DOM
  updateOrderDetails(orderDetails) {
    // Update basic order information
    this.updateElement('order-time', `Order Time: ${orderDetails.orderTime}`);
    this.updateElement('order-status', `Status: ${orderDetails.status}`);
    this.updateElement('expected-delivery-time', `Expected Delivery Time: ${orderDetails.deliveryTime}`);
    this.updateElement('total-order-cost', `Total Order Cost: ${orderDetails.price} ₽`);
    this.updateElement('address', `Address: ${orderDetails.address}`);

    // Update dishes list
    this.updateDishesList(orderDetails.dishes);
  }

  // Update order status display
  updateOrderStatus(status) {
    this.updateElement('order-status', `Status: ${status}`);
  }

  // Update a single element
  updateElement(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  // Update dishes list
  updateDishesList(dishes) {
    const dishesList = document.getElementById('dishes-list');
    if (!dishesList) return;

    dishesList.innerHTML = dishes.map(dish => `
      <li style="display: flex; align-items: center;">
        <img src="${dish.image}" alt="${dish.name}">
        <span style="margin-left: 10px;">
          ${dish.name} <div class="repo"> ${dish.amount} x ${dish.price} ₽ </div>  <div class="a7aa"> Total Price ${dish.totalPrice} ₽</div>
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

// Order Status value object to eliminate primitive obsession
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

  canBeConfirmed() {
    return this.isInProcess();
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
