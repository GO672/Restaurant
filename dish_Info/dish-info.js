// Dish Info Service to handle dish-related operations
class DishInfoService {
  constructor() {
    this.baseUrl = 'https://food-delivery.int.kreosoft.space/api';
  }

  // Get dish details by ID
  async getDishById(dishId) {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${dishId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dish: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dish details:', error);
      throw error;
    }
  }

  // Set rating for a dish
  async setRating(dishId, ratingScore) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/dish/${dishId}/rating?ratingScore=${ratingScore}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to set rating: ${response.status}`);
      }

      console.log(`Rating ${ratingScore} set successfully for dish ${dishId}`);
      return true;
    } catch (error) {
      console.error('Error setting rating:', error);
      throw error;
    }
  }

  // Check if user can rate a dish
  async checkRatingPermission(dishId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/dish/${dishId}/rating/check`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking rating permission:', error);
      return false;
    }
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }
}

// DOM Service to handle DOM manipulations
class DOMService {
  constructor() {
    this.dishInfoService = new DishInfoService();
  }

  // Update dish information in the DOM
  updateDishInfo(dishData) {
    const elements = {
      name: document.getElementById('dish-name'),
      image: document.getElementById('dish-image'),
      category: document.getElementById('dish-category'),
      price: document.getElementById('dish-price'),
      description: document.getElementById('dish-description'),
      vegetarian: document.getElementById('dish-vegetarin')
    };

    // Update text content
    if (elements.name) elements.name.textContent = dishData.name;
    if (elements.category) elements.category.textContent = `Category: ${dishData.category}`;
    if (elements.price) elements.price.textContent = `Price: ${dishData.price} ₽`;
    if (elements.description) elements.description.textContent = `Description: ${dishData.description}`;
    if (elements.vegetarian) elements.vegetarian.textContent = `${dishData.vegetarian ? 'Vegetarian' : 'Not Vegetarian'}`;

    // Update image
    if (elements.image) {
      elements.image.src = dishData.image;
      elements.image.alt = dishData.name;
    }
  }

  // Create rating stars
  createRatingStars(dishData) {
    const ratingFieldset = document.createElement('div');
    ratingFieldset.classList.add('rate');
    ratingFieldset.setAttribute('data-dish-id', dishData.id);

    // Create star inputs
    for (let i = 20; i > 0; i--) {
      const ratingInput = document.createElement('input');
      ratingInput.setAttribute('type', 'radio');
      ratingInput.setAttribute('id', `rating${i}-${dishData.id}`);
      ratingInput.setAttribute('name', `${dishData.id}-rating`);
      ratingInput.disabled = true; // Initially disabled
      const value = i % 2 === 0 ? i / 2 : (i + 1) / 2;
      ratingInput.setAttribute('value', `${value}`);

      const ratingLabel = document.createElement('label');
      ratingLabel.setAttribute('for', `rating${i}-${dishData.id}`);
      ratingLabel.setAttribute('title', `${value} stars`);
      if (i % 2 !== 0) {
        ratingLabel.classList.add('half');
      }

      ratingFieldset.appendChild(ratingInput);
      ratingFieldset.appendChild(ratingLabel);
    }

    // Set current rating
    this.setCurrentRating(ratingFieldset, dishData.rating);

    // Insert rating fieldset into DOM
    const priceElement = document.getElementById('dish-price');
    if (priceElement && priceElement.parentNode) {
      priceElement.parentNode.insertBefore(ratingFieldset, priceElement);
    }

    return ratingFieldset;
  }

  // Set current rating display
  setCurrentRating(ratingFieldset, rating) {
    const ratingInputs = ratingFieldset.querySelectorAll('input');
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const fullStarIndex = 20 - fullStars * 2;

    if (ratingInputs[fullStarIndex]) {
      ratingInputs[fullStarIndex].checked = true;
    }

    if (halfStar && ratingInputs[fullStarIndex - 1]) {
      ratingInputs[fullStarIndex - 1].checked = true;
    }
  }

  // Enable rating functionality
  enableRating(ratingFieldset, dishId) {
    const ratingInputs = ratingFieldset.querySelectorAll('input');
    
    // Enable all rating inputs
    ratingInputs.forEach(input => {
      input.disabled = false;
    });

    // Add change event listener
    ratingFieldset.addEventListener('change', async (event) => {
      const selectedInput = event.target;
      if (selectedInput.type === 'radio') {
        const selectedRating = parseFloat(selectedInput.value);
        try {
          await this.dishInfoService.setRating(dishId, selectedRating);
        } catch (error) {
          console.error('Failed to set rating:', error);
        }
      }
    });
  }

  // Show notification
  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, duration);
  }
}

// URL Service to handle URL parameter extraction
class URLService {
  // Get parameter value from URL
  static getParameterByName(name, url = window.location.href) {
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  // Get dish ID from URL
  static getDishId() {
    return this.getParameterByName('id');
  }
}

// Main Dish Info Controller
class DishInfoController {
  constructor() {
    this.dishInfoService = new DishInfoService();
    this.domService = new DOMService();
    this.dishId = URLService.getDishId();
  }

  // Initialize the dish info page
  async initialize() {
    if (!this.dishId) {
      console.error('No dish ID provided in URL');
      return;
    }

    try {
      // Fetch dish data
      const dishData = await this.dishInfoService.getDishById(this.dishId);
      
      // Update DOM with dish information
      this.domService.updateDishInfo(dishData);
      
      // Create and setup rating stars
      const ratingFieldset = this.domService.createRatingStars(dishData);
      
      // Check rating permission and enable if allowed
      const canRate = await this.dishInfoService.checkRatingPermission(this.dishId);
      if (canRate) {
        this.domService.enableRating(ratingFieldset, this.dishId);
      }
      
    } catch (error) {
      console.error('Failed to initialize dish info:', error);
      this.domService.showNotification('Failed to load dish information', 5000);
    }
  }
}

// Initialize the application
const dishInfoController = new DishInfoController();
dishInfoController.initialize(); 
