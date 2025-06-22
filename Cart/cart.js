// Helper function to create cart item element
const createCartItemElement = (item) => {
  const cartItem = document.createElement('div');
  cartItem.classList.add('cart-item');
  
  // Add image
  const image = document.createElement('img');
  image.src = item.image;
  cartItem.appendChild(image);
  
  // Add name
  const name = document.createElement('div');
  name.textContent = item.name;
  cartItem.appendChild(name);
  
  // Add price
  const price = document.createElement('div');
  price.textContent = `Price: ${item.price} ₽`;
  cartItem.appendChild(price);
  
  return cartItem;
};

// Helper function to create numeric input with buttons
const createNumericInput = (item) => {
  const numericInput = document.createElement('div');
  numericInput.classList.add('numeric-input');
  
  const minusButton = document.createElement('button');
  minusButton.innerHTML = '<i class="fa-solid fa-minus"></i>';
  
  const numericDisplay = document.createElement('span');
  numericDisplay.classList.add('numeric-display');
  numericDisplay.textContent = item.amount;
  
  const plusButton = document.createElement('button');
  plusButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
  
  // Set initial state
  if (parseInt(numericDisplay.textContent) === 1) {
    minusButton.disabled = true;
  }
  
  numericInput.appendChild(minusButton);
  numericInput.appendChild(numericDisplay);
  numericInput.appendChild(plusButton);
  
  return { numericInput, minusButton, numericDisplay, plusButton };
};

// Helper function to set up numeric input event listeners
const setupNumericInputListeners = (minusButton, numericDisplay, plusButton, item) => {
  minusButton.addEventListener('click', async () => {
    let value = parseInt(numericDisplay.textContent);
    value = Math.max(value - 1, 0);
    numericDisplay.textContent = value;
    
    if (parseInt(numericDisplay.textContent) === 1) {
      minusButton.disabled = true;
    }
    
    try {
      await cartService.updateQuantity(item.id, false); // decrease quantity
    } catch (error) {
      showNotification('Failed to update quantity', 2000);
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
      await cartService.addItem(item.id);
    } catch (error) {
      showNotification('Failed to add item to cart', 2000);
    }
  });
};

// Helper function to set up hover effects
const setupHoverEffects = (cartItem) => {
  cartItem.addEventListener('mouseenter', () => {
    cartItem.hoverTimeout = setTimeout(() => {
      cartItem.classList.add('show-trash');
    }, 100);
  });
  
  cartItem.addEventListener('mouseleave', () => {
    clearTimeout(cartItem.hoverTimeout);
    cartItem.classList.remove('show-trash');
  });
};

// Helper function to create trash icon
const createTrashIcon = (item, cartItem) => {
  const trashIcon = document.createElement('i');
  trashIcon.classList.add('fa-solid', 'fa-trash');
  trashIcon.addEventListener('click', async () => {
    try {
      await cartService.removeItem(item.id, cartItem);
    } catch (error) {
      showNotification('Failed to remove item from cart', 2000);
    }
  });
  return trashIcon;
};

// Helper function to create total price element
const createTotalPriceElement = (item) => {
  const totalPrice = document.createElement('div');
  totalPrice.textContent = `Total Price: ${item.totalPrice} ₽`;
  return totalPrice;
};

// Helper function to handle empty cart state
const handleEmptyCart = (cartItemsContainer, deliveryContainer) => {
  cartItemsContainer.innerHTML = '<h5>Cart is empty...)</h5>';
  deliveryContainer.style.display = 'none';
};

// Helper function to check if cart becomes empty after item removal
const checkCartEmptyState = () => {
  const cartItems = document.querySelectorAll('.cart-item');
  if (cartItems.length === 0) {
    window.location.reload();
  }
};

const displayCartItems = (cartData) => {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const deliveryContainer = document.querySelector('.delivery-container');
  
  cartItemsContainer.innerHTML = '';

  if (cartData.length === 0) {
    handleEmptyCart(cartItemsContainer, deliveryContainer);
    return;
  }

  cartData.forEach(item => {
    // Create main cart item element
    const cartItem = createCartItemElement(item);
    
    // Create and set up numeric input
    const { numericInput, minusButton, numericDisplay, plusButton } = createNumericInput(item);
    setupNumericInputListeners(minusButton, numericDisplay, plusButton, item);
    cartItem.appendChild(numericInput);
    
    // Add total price
    const totalPrice = createTotalPriceElement(item);
    cartItem.appendChild(totalPrice);
    
    // Add trash icon
    const trashIcon = createTrashIcon(item, cartItem);
    cartItem.appendChild(trashIcon);
    
    // Set up hover effects
    setupHoverEffects(cartItem);
    
    cartItemsContainer.appendChild(cartItem);
  });
};

// Retrieve input values
const deliveryDateInput = document.getElementById('Date');
const addressInput = document.getElementById('address');
const createOrderButton = document.querySelector('.delivery-container button');

// Function to display a temporary notification
const showNotification = (message, duration = 1500) => {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.classList.add('notification');
  document.body.appendChild(notification);

  // Automatically remove the notification after the specified duration
  setTimeout(() => {
    notification.remove();
    window.location.reload();
  }, duration);
};

// Event listener for create order button
createOrderButton.addEventListener('click', async () => {
  // Get delivery date and address values
  const deliveryTimeValue = deliveryDateInput.value;
  const addressValue = addressInput.value;

  try {
    // Create order object with validation
    const orderData = new OrderData(deliveryTimeValue, addressValue);
    
    // Convert order data to JSON
    const jsonData = JSON.stringify(orderData);

    // Retrieve token from local storage
    const token = localStorage.getItem('token');

    // Make sure token exists
    if (!token) {
      console.error('No token found in local storage.');
      return;
    }

    // Make POST request to create order
    const response = await fetch('https://food-delivery.int.kreosoft.space/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: jsonData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Display notification on successful order creation
    showNotification('Order created successfully');
  } catch (error) {
    // Handle validation errors with user-friendly messages
    if (error.message.includes('Delivery time') || error.message.includes('Address')) {
      showNotification(error.message, 3000); // Show validation errors longer
    } else {
      console.error('There was a problem creating the order:', error);
      showNotification('Failed to create order. Please try again.', 3000);
    }
  }
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
    
    // Check if delivery time is within business hours (9 AM - 10 PM)
    const hours = date.getHours();
    if (hours < 9 || hours >= 22) {
      throw new Error('Delivery time must be between 9:00 AM and 10:00 PM');
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
    
    if (value.trim().length < 10) {
      throw new Error('Address must be at least 10 characters long');
    }
    
    if (value.trim().length > 200) {
      throw new Error('Address must be less than 200 characters');
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

// Cart service class to encapsulate all cart operations
class CartService {
  constructor() {
    this.baseUrl = 'https://food-delivery.int.kreosoft.space/api/basket';
    this.debounceTimer = null;
  }

  // Get authentication token
  getAuthToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  // Get auth headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  // Debounced cart refresh
  async refreshCart() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      await this.getCartData();
    }, 210);
  }

  // Add item to cart
  async addItem(itemId) {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${itemId}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      console.log('Item added to cart successfully');
      await this.refreshCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeItem(itemId, cartItemElement) {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${itemId}?increase=false`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

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
      const response = await fetch(`${this.baseUrl}/dish/${itemId}?increase=${increase}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }

      console.log(`Quantity ${increase ? 'increased' : 'decreased'} successfully`);
      await this.refreshCart();
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }

  // Get cart data
  async getCartData() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }

      const data = await response.json();
      console.log('Cart Data:', data);
      displayCartItems(data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      throw error;
    }
  }

  // Check if cart is empty
  checkCartEmptyState() {
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length === 0) {
      window.location.reload();
    }
  }
}

// Initialize cart service
const cartService = new CartService();

// Initialize cart service and load initial data
cartService.getCartData();

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
