// Configuration object to eliminate magic numbers and make timing values explicit
const Config = {
  // Debounce timing for cart operations (prevents excessive API calls during rapid user interactions)
  DEBOUNCE_DELAY_MS: 210,
  
  // Notification display durations
  NOTIFICATION: {
    DEFAULT_DURATION_MS: 1500,        // Standard notification duration
    ERROR_DURATION_MS: 2000,          // Error messages shown longer for better visibility
    VALIDATION_ERROR_DURATION_MS: 3000 // Validation errors shown longest for user comprehension
  },
  
  // Hover effect timing
  HOVER: {
    SHOW_TRASH_DELAY_MS: 100          // Delay before showing trash icon on hover
  },
  
  // Business hours for delivery validation
  BUSINESS_HOURS: {
    OPEN_HOUR: 9,                     // Restaurant opens at 9 AM
    CLOSE_HOUR: 22                    // Restaurant closes at 10 PM
  },
  
  // Address validation constraints
  ADDRESS: {
    MIN_LENGTH: 10,                   // Minimum address length
    MAX_LENGTH: 200                   // Maximum address length
  }
};

// Value object for delivery time with validation
class DeliveryTime {
  constructor(value) {
    if (!value) {
      throw new Error('Delivery time is required');
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid delivery time format. Use ISO 8601 format (YYYY-MM-DDTHH:MM)');
    }
    
    const now = new Date();
    if (date <= now) {
      throw new Error('Delivery time must be in the future');
    }
    
    // Check if delivery time is within business hours
    const hours = date.getHours();
    if (hours < Config.BUSINESS_HOURS.OPEN_HOUR || hours >= Config.BUSINESS_HOURS.CLOSE_HOUR) {
      throw new Error(`Delivery time must be between ${Config.BUSINESS_HOURS.OPEN_HOUR}:00 AM and ${Config.BUSINESS_HOURS.CLOSE_HOUR}:00 PM`);
    }
    
    this.value = value;
    this.date = date;
  }
  
  toString() {
    return this.value;
  }
  
  toJSON() {
    return this.value;
  }
}

// Value object for address with validation
class Address {
  constructor(value) {
    if (!value || value.trim().length === 0) {
      throw new Error('Address is required');
    }
    
    if (value.trim().length < Config.ADDRESS.MIN_LENGTH) {
      throw new Error(`Address must be at least ${Config.ADDRESS.MIN_LENGTH} characters long`);
    }
    
    if (value.trim().length > Config.ADDRESS.MAX_LENGTH) {
      throw new Error(`Address must be less than ${Config.ADDRESS.MAX_LENGTH} characters`);
    }
    
    // Basic format validation (should contain street number and name)
    const addressPattern = /^\d+\s+[A-Za-z\s]+/;
    if (!addressPattern.test(value.trim())) {
      throw new Error('Address should start with a number followed by street name');
    }
    
    this.value = value.trim();
  }
  
  toString() {
    return this.value;
  }
  
  toJSON() {
    return this.value;
  }
}

// Order data class that uses value objects
class OrderData {
  constructor(deliveryTime, address) {
    this.deliveryTime = new DeliveryTime(deliveryTime);
    this.address = new Address(address);
  }
  
  toJSON() {
    return {
      deliveryTime: this.deliveryTime.toJSON(),
      address: this.address.toJSON()
    };
  }
}

// DOM access helper methods to eliminate message chains
const DOMHelpers = {
  // Get cart items container
  getCartItemsContainer() {
    const container = document.getElementById('cart-items-container');
    if (!container) {
      throw new Error('Cart items container not found');
    }
    return container;
  },

  // Get delivery container
  getDeliveryContainer() {
    const container = document.querySelector('.delivery-container');
    if (!container) {
      throw new Error('Delivery container not found');
    }
    return container;
  },

  // Get all cart items
  getCartItems() {
    return document.querySelectorAll('.cart-item');
  },

  // Get delivery date input
  getDeliveryDateInput() {
    const input = document.getElementById('Date');
    if (!input) {
      throw new Error('Delivery date input not found');
    }
    return input;
  },

  // Get address input
  getAddressInput() {
    const input = document.getElementById('address');
    if (!input) {
      throw new Error('Address input not found');
    }
    return input;
  },

  // Get create order button
  getCreateOrderButton() {
    const button = document.querySelector('.delivery-container button');
    if (!button) {
      throw new Error('Create order button not found');
    }
    return button;
  },

  // Get logout link
  getLogoutLink() {
    const link = document.getElementById('logout-link');
    if (!link) {
      throw new Error('Logout link not found');
    }
    return link;
  },

  // Get profile dropdown
  getProfileDropdown() {
    const dropdown = document.querySelector('.select-dropdown1');
    if (!dropdown) {
      throw new Error('Profile dropdown not found');
    }
    return dropdown;
  }
};

// Authentication service to centralize token management and eliminate duplication
class AuthService {
  constructor() {
    this.tokenKey = 'token';
  }

  // Get authentication token
  getToken() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  // Check if user is authenticated
  isAuthenticated() {
    try {
      return !!this.getToken();
    } catch {
      return false;
    }
  }

  // Clear authentication token
  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // Set authentication token
  setToken(token) {
    if (!token) {
      throw new Error('Token cannot be empty');
    }
    localStorage.setItem(this.tokenKey, token);
  }

  // Get authorization header
  getAuthHeader() {
    return `Bearer ${this.getToken()}`;
  }

  // Logout user
  async logout() {
    try {
      const apiClient = new ApiClient('https://food-delivery.int.kreosoft.space/api/account');
      await apiClient.post('/logout');
      this.clearToken();
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear token even if logout request fails
      this.clearToken();
      throw error;
    }
  }
}

// API client class to centralize HTTP requests and eliminate header duplication
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Get standard headers for authenticated requests
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': authService.getAuthHeader()
    };
  }

  // GET request
  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': authService.getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error(`GET request failed: ${response.status}`);
    }

    return response.json();
  }

  // POST request
  async post(endpoint, data = null) {
    const options = {
      method: 'POST',
      headers: this.getHeaders()
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

  // DELETE request
  async delete(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`DELETE request failed: ${response.status}`);
    }

    return response;
  }
}

// Cart service class to encapsulate all cart operations
class CartService {
  constructor() {
    this.apiClient = new ApiClient('https://food-delivery.int.kreosoft.space/api/basket');
    this.debounceTimer = null;
  }

  // Add item to cart
  async addItem(itemId) {
    try {
      await this.apiClient.post(`/dish/${itemId}`);
      console.log('Item added to cart successfully');
      
      // Debounced cart refresh
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        await this.getCartData();
      }, Config.DEBOUNCE_DELAY_MS);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeItem(itemId, cartItemElement) {
    try {
      await this.apiClient.delete(`/dish/${itemId}?increase=false`);
      
      // Remove from DOM
      cartItemElement.remove();
      
      // Check if cart is empty
      this.checkCartEmptyState();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  // Update item quantity
  async updateQuantity(itemId, increase = false) {
    try {
      await this.apiClient.delete(`/dish/${itemId}?increase=${increase}`);
      console.log(`Quantity ${increase ? 'increased' : 'decreased'} successfully`);
      
      // Debounced cart refresh
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        await this.getCartData();
      }, Config.DEBOUNCE_DELAY_MS);
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }

  // Get cart data
  async getCartData() {
    try {
      const data = await this.apiClient.get('');
      console.log('Cart Data:', data);
      cartManager.displayCartItems(data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      throw error;
    }
  }

  // Check if cart is empty
  checkCartEmptyState() {
    const cartItems = DOMHelpers.getCartItems();
    if (cartItems.length === 0) {
      window.location.reload();
    }
  }
}

// Initialize services
const authService = new AuthService();
const cartManager = new CartManager();

// Cart Manager class to consolidate all cart-related functionality
class CartManager {
  constructor() {
    this.cartService = new CartService();
    this.debounceTimer = null;
    this.init();
  }

  // Initialize cart manager
  init() {
    this.loadCartData();
    this.setupEventListeners();
  }

  // Load initial cart data
  async loadCartData() {
    try {
      await this.cartService.getCartData();
    } catch (error) {
      console.error('Failed to load cart data:', error);
      this.showNotification('Failed to load cart', Config.NOTIFICATION.ERROR_DURATION_MS);
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    // Order creation
    const createOrderButton = DOMHelpers.getCreateOrderButton();
    createOrderButton.addEventListener('click', this.handleOrderCreation.bind(this));

    // Logout
    const logoutLink = DOMHelpers.getLogoutLink();
    logoutLink.addEventListener('click', this.handleLogout.bind(this));

    // Profile dropdown
    const profileDropdown = DOMHelpers.getProfileDropdown();
    profileDropdown.addEventListener('click', this.handleProfileDropdown.bind(this));

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  // Handle order creation
  async handleOrderCreation() {
    const deliveryDateInput = DOMHelpers.getDeliveryDateInput();
    const addressInput = DOMHelpers.getAddressInput();

    const deliveryTimeValue = deliveryDateInput.value;
    const addressValue = addressInput.value;

    try {
      const orderData = new OrderData(deliveryTimeValue, addressValue);
      const orderApiClient = new ApiClient('https://food-delivery.int.kreosoft.space/api');
      await orderApiClient.post('/order', orderData);
      this.showNotification('Order created successfully');
    } catch (error) {
      if (error.message.includes('Delivery time') || error.message.includes('Address')) {
        this.showNotification(error.message, Config.NOTIFICATION.VALIDATION_ERROR_DURATION_MS);
      } else {
        console.error('Order creation failed:', error);
        this.showNotification('Failed to create order. Please try again.', Config.NOTIFICATION.VALIDATION_ERROR_DURATION_MS);
      }
    }
  }

  // Handle logout
  async handleLogout(event) {
    event.preventDefault();
    try {
      await authService.logout();
      window.location.href = '/Login/login.html';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/Login/login.html';
    }
  }

  // Handle profile dropdown
  handleProfileDropdown() {
    const dropdownContent = this.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  }

  // Handle outside click for dropdown
  handleOutsideClick(event) {
    const dropdowns = document.querySelectorAll('.select-dropdown1');
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) {
        dropdown.querySelector('.dropdown-content').style.display = 'none';
      }
    });
  }

  // Display cart items
  displayCartItems(cartData) {
    const cartItemsContainer = DOMHelpers.getCartItemsContainer();
    const deliveryContainer = DOMHelpers.getDeliveryContainer();
    
    cartItemsContainer.innerHTML = '';

    if (cartData.length === 0) {
      this.handleEmptyCart(cartItemsContainer, deliveryContainer);
      return;
    }

    cartData.forEach(item => {
      const cartItem = this.createCartItemElement(item);
      const { numericInput, minusButton, numericDisplay, plusButton } = this.createNumericInput(item);
      
      this.setupNumericInputListeners(minusButton, numericDisplay, plusButton, item);
      cartItem.appendChild(numericInput);
      
      const totalPrice = this.createTotalPriceElement(item);
      cartItem.appendChild(totalPrice);
      
      const trashIcon = this.createTrashIcon(item, cartItem);
      cartItem.appendChild(trashIcon);
      
      this.setupHoverEffects(cartItem);
      cartItemsContainer.appendChild(cartItem);
    });
  }

  // Create cart item element
  createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    
    const image = document.createElement('img');
    image.src = item.image;
    cartItem.appendChild(image);
    
    const name = document.createElement('div');
    name.textContent = item.name;
    cartItem.appendChild(name);
    
    const price = document.createElement('div');
    price.textContent = `Price: ${item.price} ₽`;
    cartItem.appendChild(price);
    
    return cartItem;
  }

  // Create numeric input with buttons
  createNumericInput(item) {
    const numericInput = document.createElement('div');
    numericInput.classList.add('numeric-input');
    
    const minusButton = document.createElement('button');
    minusButton.innerHTML = '<i class="fa-solid fa-minus"></i>';
    
    const numericDisplay = document.createElement('span');
    numericDisplay.classList.add('numeric-display');
    numericDisplay.textContent = item.amount;
    
    const plusButton = document.createElement('button');
    plusButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    
    if (parseInt(numericDisplay.textContent) === 1) {
      minusButton.disabled = true;
    }
    
    numericInput.appendChild(minusButton);
    numericInput.appendChild(numericDisplay);
    numericInput.appendChild(plusButton);
    
    return { numericInput, minusButton, numericDisplay, plusButton };
  }

  // Setup numeric input event listeners
  setupNumericInputListeners(minusButton, numericDisplay, plusButton, item) {
    minusButton.addEventListener('click', async () => {
      let value = parseInt(numericDisplay.textContent);
      value = Math.max(value - 1, 0);
      numericDisplay.textContent = value;
      
      if (parseInt(numericDisplay.textContent) === 1) {
        minusButton.disabled = true;
      }
      
      try {
        await this.cartService.updateQuantity(item.id, false);
      } catch (error) {
        this.showNotification('Failed to update quantity', Config.NOTIFICATION.DEFAULT_DURATION_MS);
      }
    });
    
    plusButton.addEventListener('click', async () => {
      let value = parseInt(numericDisplay.textContent);
      value++;
      numericDisplay.textContent = value;
      
      if (parseInt(numericDisplay.textContent) !== 1) {
        minusButton.disabled = false;
      }
      
      try {
        await this.cartService.addItem(item.id);
      } catch (error) {
        this.showNotification('Failed to add item to cart', Config.NOTIFICATION.DEFAULT_DURATION_MS);
      }
    });
  }

  // Setup hover effects
  setupHoverEffects(cartItem) {
    cartItem.addEventListener('mouseenter', () => {
      cartItem.hoverTimeout = setTimeout(() => {
        cartItem.classList.add('show-trash');
      }, Config.HOVER.SHOW_TRASH_DELAY_MS);
    });
    
    cartItem.addEventListener('mouseleave', () => {
      clearTimeout(cartItem.hoverTimeout);
      cartItem.classList.remove('show-trash');
    });
  }

  // Create trash icon
  createTrashIcon(item, cartItem) {
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa-solid', 'fa-trash');
    trashIcon.addEventListener('click', async () => {
      try {
        await this.cartService.removeItem(item.id, cartItem);
      } catch (error) {
        this.showNotification('Failed to remove item from cart', Config.NOTIFICATION.DEFAULT_DURATION_MS);
      }
    });
    return trashIcon;
  }

  // Create total price element
  createTotalPriceElement(item) {
    const totalPrice = document.createElement('div');
    totalPrice.textContent = `Total Price: ${item.totalPrice} ₽`;
    return totalPrice;
  }

  // Handle empty cart state
  handleEmptyCart(cartItemsContainer, deliveryContainer) {
    cartItemsContainer.innerHTML = '<h5>Cart is empty...)</h5>';
    deliveryContainer.style.display = 'none';
  }

  // Show notification
  showNotification(message, duration = Config.NOTIFICATION.DEFAULT_DURATION_MS) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
      window.location.reload();
    }, duration);
  }
}
