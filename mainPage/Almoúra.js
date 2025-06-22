// API Client to centralize HTTP request configuration and eliminate data clumps
class ApiClient {
  constructor() {
    this.baseUrl = 'https://food-delivery.int.kreosoft.space/api';
  }

  // Get default headers for authenticated requests
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Get headers for non-authenticated requests
  getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  // Make GET request
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => url.searchParams.append(key, value));
        } else {
          url.searchParams.append(key, params[key]);
        }
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Make authenticated GET request
  async getAuth(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => url.searchParams.append(key, value));
        } else {
          url.searchParams.append(key, params[key]);
        }
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Make POST request
  async post(endpoint, data = null, useAuth = false) {
    const options = {
      method: 'POST',
      headers: useAuth ? this.getAuthHeaders() : this.getHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Make authenticated POST request
  async postAuth(endpoint, data = null) {
    return this.post(endpoint, data, true);
  }

  // Make PUT request
  async put(endpoint, data = null, useAuth = false) {
    const options = {
      method: 'PUT',
      headers: useAuth ? this.getAuthHeaders() : this.getHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Make authenticated PUT request
  async putAuth(endpoint, data = null) {
    return this.put(endpoint, data, true);
  }

  // Make DELETE request
  async delete(endpoint, useAuth = false) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: useAuth ? this.getAuthHeaders() : this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Make authenticated DELETE request
  async deleteAuth(endpoint) {
    return this.delete(endpoint, true);
  }
}

// Authentication Service to centralize auth-related operations
class AuthService {
  constructor() {
    this.apiClient = new ApiClient();
  }

  // Get authentication token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Logout user
  async logout() {
    try {
      await this.apiClient.postAuth('/account/logout');
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }

  // Redirect to login page
  redirectToLogin() {
    window.location.href = '/Login/login.html';
  }

  // Handle authentication error
  handleAuthError(error) {
    console.error('Authentication error:', error);
    if (error.message.includes('401') || error.message.includes('403')) {
      localStorage.removeItem('token');
      this.redirectToLogin();
    }
  }
}

// Page state class to encapsulate pagination and filtering state
class PageState {
  constructor() {
    this._page = 1;
    this._totalPages = 0;
    this._defaultSortingOption = 'NameAsc';
    this._isVegetarian = false;
    this._selectedCategories = [];
    this._currentSorting = null;
  }

  // Get current page
  getPage() {
    return this._page;
  }

  // Set current page
  setPage(pageNumber) {
    if (pageNumber < 1) {
      throw new Error('Page number must be greater than 0');
    }
    this._page = pageNumber;
  }

  // Get total pages
  getTotalPages() {
    return this._totalPages;
  }

  // Set total pages
  setTotalPages(total) {
    if (total < 0) {
      throw new Error('Total pages cannot be negative');
    }
    this._totalPages = total;
  }

  // Get default sorting option
  getDefaultSortingOption() {
    return this._defaultSortingOption;
  }

  // Check if vegetarian filter is active
  isVegetarian() {
    return this._isVegetarian;
  }

  // Set vegetarian filter
  setVegetarian(isVegetarian) {
    this._isVegetarian = Boolean(isVegetarian);
  }

  // Get selected categories
  getSelectedCategories() {
    return [...this._selectedCategories]; // Return copy to prevent external modification
  }

  // Set selected categories
  setSelectedCategories(categories) {
    this._selectedCategories = Array.isArray(categories) ? [...categories] : [];
  }

  // Add category to selection
  addCategory(category) {
    if (!this._selectedCategories.includes(category)) {
      this._selectedCategories.push(category);
    }
  }

  // Remove category from selection
  removeCategory(category) {
    this._selectedCategories = this._selectedCategories.filter(cat => cat !== category);
  }

  // Clear all selected categories
  clearCategories() {
    this._selectedCategories = [];
  }

  // Get current sorting
  getCurrentSorting() {
    return this._currentSorting;
  }

  // Set current sorting
  setCurrentSorting(sorting) {
    this._currentSorting = sorting;
  }

  // Reset to first page
  resetToFirstPage() {
    this._page = 1;
  }

  // Check if on first page
  isFirstPage() {
    return this._page === 1;
  }

  // Check if on last page
  isLastPage() {
    return this._page >= this._totalPages;
  }

  // Go to next page
  nextPage() {
    if (!this.isLastPage()) {
      this._page++;
    }
  }

  // Go to previous page
  previousPage() {
    if (!this.isFirstPage()) {
      this._page--;
    }
  }

  // Get state summary for debugging
  getStateSummary() {
    return {
      page: this._page,
      totalPages: this._totalPages,
      isVegetarian: this._isVegetarian,
      selectedCategories: this.getSelectedCategories(),
      currentSorting: this._currentSorting
    };
  }

  // Update state from URL parameters
  updateFromURLParams(urlParams) {
    const pageNumber = parseInt(urlParams.get('page'));
    if (!isNaN(pageNumber)) {
      this.setPage(pageNumber);
    }

    const isVegetarianParam = urlParams.get('vegetarian');
    if (isVegetarianParam !== null) {
      this.setVegetarian(isVegetarianParam === 'true');
    }

    const categories = urlParams.getAll('categories');
    this.setSelectedCategories(categories);

    const sortingMethod = urlParams.get('sorting');
    this.setCurrentSorting(sortingMethod);
  }
}

// URL Parameters Service to centralize URL parsing and eliminate duplicate code
class URLParamsService {
  constructor() {
    this.urlParams = new URLSearchParams(window.location.search);
  }

  // Get all URL parameters as an object
  getAllParams() {
    const params = {};
    for (const [key, value] of this.urlParams.entries()) {
      if (params[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        params[key] = value;
      }
    }
    return params;
  }

  // Get a single parameter value
  getParam(name) {
    return this.urlParams.get(name);
  }

  // Get all values for a parameter (for arrays like categories)
  getAllValues(name) {
    return this.urlParams.getAll(name);
  }

  // Get parameter as integer with fallback
  getIntParam(name, fallback = null) {
    const value = this.getParam(name);
    if (value === null) return fallback;
    const parsed = parseInt(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  // Get parameter as boolean
  getBoolParam(name, fallback = false) {
    const value = this.getParam(name);
    if (value === null) return fallback;
    return value === 'true';
  }

  // Update URL with new parameters
  updateURL(newParams) {
    const url = new URL(window.location);
    
    // Clear existing parameters
    url.search = '';
    
    // Add new parameters
    Object.keys(newParams).forEach(key => {
      if (newParams[key] !== undefined && newParams[key] !== null) {
        if (Array.isArray(newParams[key])) {
          newParams[key].forEach(value => url.searchParams.append(key, value));
        } else {
          url.searchParams.set(key, newParams[key]);
        }
      }
    });
    
    window.history.replaceState({}, '', url.toString());
  }

  // Parse and update page state from URL
  updatePageStateFromURL() {
    const pageNumber = this.getIntParam('page', 1);
    if (pageNumber !== null) {
      pageState.setPage(pageNumber);
    }

    const isVegetarian = this.getBoolParam('vegetarian', false);
    pageState.setVegetarian(isVegetarian);

    const categories = this.getAllValues('categories');
    pageState.setSelectedCategories(categories);

    const sorting = this.getParam('sorting');
    pageState.setCurrentSorting(sorting);
  }

  // Update UI elements from URL parameters
  updateUIFromURL() {
    // Update vegetarian checkbox
    const isVegetarian = this.getBoolParam('vegetarian', false);
    const vegetarianCheckbox = document.getElementById('is-vegetarian');
    if (vegetarianCheckbox) {
      vegetarianCheckbox.checked = isVegetarian;
    }

    // Update category selections
    const categories = this.getAllValues('categories');
    const categoryItems = document.querySelectorAll('.list-items .item');
    
    // Uncheck all category items
    categoryItems.forEach(item => {
      item.classList.remove('checked');
    });

    // Check selected categories
    categories.forEach(category => {
      const categoryItem = document.querySelector(`.item-text#${category}`);
      if (categoryItem) {
        categoryItem.parentElement.classList.add('checked');
      }
    });

    // Update selected categories count
    updateSelectedCategoriesCount();

    // Update sorting selection
    const sortingMethod = this.getParam('sorting');
    if (sortingMethod) {
      const sortingOption = document.getElementById(sortingMethod);
      if (sortingOption) {
        sortingOption.checked = true;
        const selectButton = document.querySelector('.select-button');
        if (selectButton) {
          const selectedValue = selectButton.querySelector('.selected-value');
          if (selectedValue && sortingOption.labels[0]) {
            selectedValue.textContent = sortingOption.labels[0].textContent;
          }
        }
      }
    }
  }

  // Build parameters object for API calls
  buildApiParams() {
    const params = {};
    
    if (pageState.isVegetarian()) {
      params.vegetarian = pageState.isVegetarian();
    }
    
    params.page = pageState.getPage();
    
    const selectedCategories = pageState.getSelectedCategories();
    if (selectedCategories.length > 0) {
      params.categories = selectedCategories;
    }

    const sortingOption = getSortingOption();
    if (sortingOption && sortingOption.id !== "None") {
      params.sorting = sortingOption.id;
    }

    return params;
  }
}

// Pagination Service to centralize pagination operations and eliminate divergent change
class PaginationService {
  constructor(pageState, urlParamsService) {
    this.pageState = pageState;
    this.urlParamsService = urlParamsService;
    this.container = null;
  }

  // Initialize pagination container
  initialize() {
    this.container = document.getElementById("pagination");
    if (!this.container) {
      console.warn('Pagination container not found');
    }
  }

  // Update pagination display
  update() {
    if (!this.container) {
      this.initialize();
    }

    const scrollPosition = window.scrollY;
    this.container.innerHTML = '';

    // Get current page from URL parameters
    const currentPage = this.urlParamsService.getIntParam('page', 1);
    this.pageState.setPage(currentPage);
    
    const totalPages = this.pageState.getTotalPages();

    // Create previous button
    this.createPreviousButton(currentPage, totalPages);

    // Create page number buttons
    this.createPageNumberButtons(currentPage, totalPages);

    // Create next button
    this.createNextButton(currentPage, totalPages);

    // Restore scroll position
    window.scrollTo(0, scrollPosition);
  }

  // Create previous button
  createPreviousButton(currentPage, totalPages) {
    if (currentPage > 1) {
      const prevButton = document.createElement('a');
      prevButton.href = "#";
      prevButton.textContent = '«';
      prevButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.goToPreviousPage();
      });
      this.container.appendChild(prevButton);
    }
  }

  // Create page number buttons
  createPageNumberButtons(currentPage, totalPages) {
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      const link = document.createElement('a');
      link.href = `#${i}`;
      link.textContent = i;
      
      if (i === currentPage) {
        link.classList.add('active');
      }
      
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.goToPage(i);
      });
      
      this.container.appendChild(link);
    }
  }

  // Create next button
  createNextButton(currentPage, totalPages) {
    if (currentPage < totalPages) {
      const nextButton = document.createElement('a');
      nextButton.href = "#";
      nextButton.textContent = '»';
      nextButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.goToNextPage();
      });
      this.container.appendChild(nextButton);
    }
  }

  // Go to specific page
  goToPage(pageNumber) {
    this.pageState.setPage(pageNumber);
    this.navigateToPage();
  }

  // Go to previous page
  goToPreviousPage() {
    this.pageState.previousPage();
    this.navigateToPage();
  }

  // Go to next page
  goToNextPage() {
    this.pageState.nextPage();
    this.navigateToPage();
  }

  // Navigate to current page (common logic for all navigation)
  navigateToPage() {
    fetchData(this.pageState.getPage());
    window.scrollTo(0, 0);
  }

  // Reset to first page
  resetToFirstPage() {
    this.pageState.resetToFirstPage();
  }

  // Get current page
  getCurrentPage() {
    return this.pageState.getPage();
  }

  // Get total pages
  getTotalPages() {
    return this.pageState.getTotalPages();
  }

  // Check if on first page
  isFirstPage() {
    return this.pageState.isFirstPage();
  }

  // Check if on last page
  isLastPage() {
    return this.pageState.isLastPage();
  }

  // Update total pages from API response
  updateTotalPages(totalPages) {
    this.pageState.setTotalPages(totalPages);
  }
}

// Rating Service to centralize rating-related API operations
class RatingService {
  constructor(apiClient, errorHandler) {
    this.apiClient = apiClient;
    this.errorHandler = errorHandler;
  }

  // Set rating for a dish
  async setRating(dishId, ratingScore) {
    try {
      await this.apiClient.postAuth(`/dish/${dishId}/rating?ratingScore=${ratingScore}`);
      this.errorHandler.showSuccess(`Rating ${ratingScore} set successfully for dish ${dishId}`);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error, `setting rating for dish ${dishId}`);
      throw error;
    }
  }

  // Check if user can rate a dish
  async checkRatingPermission(dishId) {
    try {
      return await this.apiClient.getAuth(`/dish/${dishId}/rating/check`);
    } catch (error) {
      this.errorHandler.handleError(error, `checking rating permission for dish ${dishId}`);
      return false;
    }
  }

  // Enable rating functionality for a dish
  enableRatingForDish(dishId, ratingFieldset) {
    this.checkRatingPermission(dishId)
      .then(canRate => {
        if (canRate) {
          const ratingInputs = ratingFieldset.querySelectorAll('input');
          ratingInputs.forEach(input => {
            input.disabled = false;
          });

          ratingFieldset.addEventListener('change', async (event) => {
            const selectedInput = event.target;
            if (selectedInput.type === 'radio') {
              const selectedRating = parseFloat(selectedInput.value);
              try {
                await this.setRating(dishId, selectedRating);
              } catch (error) {
                // Error already handled in setRating method
              }
            }
          });
        }
      })
      .catch(error => {
        this.errorHandler.handleError(error, `enabling rating for dish ${dishId}`);
      });
  }
}

// Cart Service to centralize cart-related API operations
class CartService {
  constructor(apiClient, errorHandler) {
    this.apiClient = apiClient;
    this.errorHandler = errorHandler;
    this.cartDataMap = new Map();
  }

  // Add dish to cart
  async addToCart(dishId) {
    try {
      await this.apiClient.postAuth(`/basket/dish/${dishId}`);
      this.errorHandler.showSuccess(`Dish ${dishId} added to cart successfully`);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error, `adding dish ${dishId} to cart`);
      throw error;
    }
  }

  // Remove dish from cart
  async removeFromCart(dishId) {
    try {
      await this.apiClient.deleteAuth(`/basket/dish/${dishId}?increase=true`);
      this.errorHandler.showSuccess(`Dish ${dishId} removed from cart successfully`);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error, `removing dish ${dishId} from cart`);
      throw error;
    }
  }

  // Get cart data
  async getCartData() {
    try {
      const cartData = await this.apiClient.getAuth('/basket');
      return cartData;
    } catch (error) {
      this.errorHandler.handleError(error, 'fetching cart data');
      return null;
    }
  }

  // Update local cart data
  updateLocalCart(dishId, quantity) {
    if (quantity > 0) {
      this.cartDataMap.set(dishId, quantity);
    } else {
      this.cartDataMap.delete(dishId);
    }
  }

  // Get local cart quantity for a dish
  getLocalQuantity(dishId) {
    return this.cartDataMap.get(dishId) || 0;
  }

  // Create cart UI elements
  createCartUI(dishId, card) {
    const addToCartBtn = document.createElement('button');
    addToCartBtn.textContent = 'Add to Cart';
    addToCartBtn.addEventListener('click', () => this.handleAddToCart(dishId, card));

    const cartSection = document.createElement('div');
    cartSection.classList.add('cart-section');
    cartSection.style.display = 'none';

    const quantityContainer = document.createElement('div');
    quantityContainer.classList.add('quantity-container');

    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = '-';
    decreaseBtn.addEventListener('click', () => this.handleDecreaseQuantity(dishId, card));

    const quantity = document.createElement('span');
    quantity.classList.add('quantity');
    quantity.textContent = '0';

    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = '+';
    increaseBtn.addEventListener('click', () => this.handleAddToCart(dishId, card));

    quantityContainer.appendChild(decreaseBtn);
    quantityContainer.appendChild(quantity);
    quantityContainer.appendChild(increaseBtn);

    cartSection.appendChild(quantityContainer);

    return { addToCartBtn, cartSection };
  }

  // Handle add to cart action
  async handleAddToCart(dishId, card) {
    try {
      await this.addToCart(dishId);
      
      const quantityElement = card.querySelector('.quantity');
      let currentQuantity = parseInt(quantityElement.textContent);
      currentQuantity++;
      quantityElement.textContent = currentQuantity;

      this.updateLocalCart(dishId, currentQuantity);

      // Show cart section if hidden
      const cartSection = card.querySelector('.cart-section');
      if (cartSection && cartSection.style.display === 'none') {
        cartSection.style.display = 'block';
      }
    } catch (error) {
      // Error already handled in addToCart method
    }
  }

  // Handle decrease quantity action
  async handleDecreaseQuantity(dishId, card) {
    try {
      await this.removeFromCart(dishId);
      
      const quantityElement = card.querySelector('.quantity');
      let currentQuantity = parseInt(quantityElement.textContent);
      
      if (currentQuantity > 0) {
        currentQuantity--;
        quantityElement.textContent = currentQuantity;

        this.updateLocalCart(dishId, currentQuantity);

        // Hide cart section if quantity is 0
        if (currentQuantity === 0) {
          const cartSection = card.querySelector('.cart-section');
          if (cartSection) {
            cartSection.style.display = 'none';
          }
        }
      }
    } catch (error) {
      // Error already handled in removeFromCart method
    }
  }
}

// Error Handler to centralize error handling and eliminate shotgun surgery
class ErrorHandler {
  constructor() {
    this.notificationContainer = null;
    this.initializeNotificationContainer();
  }

  // Initialize notification container
  initializeNotificationContainer() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'notification-container';
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(this.notificationContainer);
  }

  // Handle different types of errors
  handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);

    // Determine error type and appropriate handling
    if (this.isNetworkError(error)) {
      this.handleNetworkError(error, context);
    } else if (this.isAuthenticationError(error)) {
      this.handleAuthenticationError(error, context);
    } else if (this.isValidationError(error)) {
      this.handleValidationError(error, context);
    } else {
      this.handleGenericError(error, context);
    }
  }

  // Check if error is a network error
  isNetworkError(error) {
    return error.message.includes('Network') || 
           error.message.includes('fetch') || 
           error.message.includes('HTTP') ||
           error.name === 'TypeError' && error.message.includes('fetch');
  }

  // Check if error is an authentication error
  isAuthenticationError(error) {
    return error.message.includes('401') || 
           error.message.includes('403') || 
           error.message.includes('Unauthorized') ||
           error.message.includes('Forbidden');
  }

  // Check if error is a validation error
  isValidationError(error) {
    return error.message.includes('validation') || 
           error.message.includes('invalid') || 
           error.message.includes('required');
  }

  // Handle network errors
  handleNetworkError(error, context) {
    const message = `Network error: Unable to ${context}. Please check your internet connection and try again.`;
    this.showNotification(message, 'error');
    
    // Retry logic for network errors
    this.scheduleRetry(context);
  }

  // Handle authentication errors
  handleAuthenticationError(error, context) {
    const message = `Authentication error: Please log in again to continue.`;
    this.showNotification(message, 'warning');
    
    // Redirect to login after a delay
    setTimeout(() => {
      window.location.href = '/Login/login.html';
    }, 2000);
  }

  // Handle validation errors
  handleValidationError(error, context) {
    const message = `Validation error: ${error.message}`;
    this.showNotification(message, 'warning');
  }

  // Handle generic errors
  handleGenericError(error, context) {
    const message = `An unexpected error occurred while ${context}. Please try again.`;
    this.showNotification(message, 'error');
  }

  // Show notification to user
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 12px 20px;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
      max-width: 100%;
      word-wrap: break-word;
    `;
    
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      float: right;
      margin-left: 10px;
    `;
    closeBtn.onclick = () => this.removeNotification(notification);
    
    notification.appendChild(closeBtn);
    this.notificationContainer.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  // Remove notification
  removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  // Get notification color based on type
  getNotificationColor(type) {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    return colors[type] || colors.info;
  }

  // Schedule retry for network errors
  scheduleRetry(context, maxRetries = 3) {
    let retryCount = 0;
    
    const retry = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        this.showNotification(`Retrying ${context}... (${retryCount}/${maxRetries})`, 'info', 2000);
        
        // Implement retry logic here based on context
        setTimeout(() => {
          // This would be implemented based on the specific context
          console.log(`Retry attempt ${retryCount} for ${context}`);
        }, 1000 * retryCount);
      } else {
        this.showNotification(`Failed to ${context} after ${maxRetries} attempts. Please try again later.`, 'error');
      }
    };
    
    setTimeout(retry, 2000);
  }

  // Handle async operations with error handling
  async handleAsyncOperation(operation, context = '') {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context);
      throw error; // Re-throw for calling code to handle if needed
    }
  }

  // Handle promise operations with error handling
  handlePromiseOperation(promise, context = '') {
    return promise.catch(error => {
      this.handleError(error, context);
      throw error;
    });
  }

  // Clear all notifications
  clearAllNotifications() {
    if (this.notificationContainer) {
      this.notificationContainer.innerHTML = '';
    }
  }

  // Show success notification
  showSuccess(message, duration = 3000) {
    this.showNotification(message, 'success', duration);
  }

  // Show error notification
  showError(message, duration = 5000) {
    this.showNotification(message, 'error', duration);
  }

  // Show warning notification
  showWarning(message, duration = 4000) {
    this.showNotification(message, 'warning', duration);
  }

  // Show info notification
  showInfo(message, duration = 3000) {
    this.showNotification(message, 'info', duration);
  }
}

// Rating UI Service to decouple DOM logic from RatingService
class RatingUIService {
  constructor(ratingService, errorHandler) {
    this.ratingService = ratingService;
    this.errorHandler = errorHandler;
  }

  // Create and setup rating UI for a dish
  setupRatingUI(dish, card) {
    const ratingFieldset = document.createElement('div');
    ratingFieldset.classList.add('rate');
    ratingFieldset.setAttribute('data-dish-id', dish.id);

    for (let i = 20; i > 0; i--) {
      const ratingInput = document.createElement('input');
      ratingInput.setAttribute('type', 'radio');
      ratingInput.setAttribute('id', `rating${i}-${dish.id}`);
      ratingInput.setAttribute('name', `${dish.id}-rating`);
      const value = i % 2 === 0 ? i / 2 : (i + 1) / 2;
      ratingInput.setAttribute('value', `${value}`);

      const ratingLabel = document.createElement('label');
      ratingLabel.setAttribute('for', `rating${i}-${dish.id}`);
      ratingLabel.setAttribute('title', `${value} stars`);
      if (i % 2 !== 0) {
        ratingLabel.classList.add('half');
      }

      ratingFieldset.appendChild(ratingInput);
      ratingFieldset.appendChild(ratingLabel);
    }

    // Set current rating
    this.setCurrentRating(ratingFieldset, dish.rating);

    // Enable rating functionality
    this.enableRating(dish.id, ratingFieldset);

    // Attach to card
    card.appendChild(ratingFieldset);
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
  enableRating(dishId, ratingFieldset) {
    this.ratingService.checkRatingPermission(dishId)
      .then(canRate => {
        if (canRate) {
          const ratingInputs = ratingFieldset.querySelectorAll('input');
          ratingInputs.forEach(input => {
            input.disabled = false;
          });

          ratingFieldset.addEventListener('change', async (event) => {
            const selectedInput = event.target;
            if (selectedInput.type === 'radio') {
              const selectedRating = parseFloat(selectedInput.value);
              try {
                await this.ratingService.setRating(dishId, selectedRating);
              } catch (error) {
                // Error already handled in setRating method
              }
            }
          });
        }
      })
      .catch(error => {
        this.errorHandler.handleError(error, `enabling rating for dish ${dishId}`);
      });
  }
}

// Enhanced DOM Helper Service to eliminate message chains
class DOMHelperService {
  constructor() {
    this.dropdownSelectors = {
      profile: '.select-dropdown1',
      dropdownContent: '.dropdown-content',
      signUpLink: 'header nav ul li:nth-child(4)',
      loginLink: 'header nav ul li:nth-child(5)',
      logoutLink: '#logout-link'
    };
    
    this.commonSelectors = {
      cards: '#cards',
      filterBtn: '.filter-btn',
      vegetarianCheckbox: '#is-vegetarian',
      checkedItems: '.list-items .item.checked',
      itemText: '.item-text',
      buttonText: '.btn-text',
      sortingOption: '.select-dropdown input[type="radio"]:checked',
      selectBtn: '.select-btn',
      items: '.item',
      customSelect: '.custom-select',
      selectButton: '.select-button',
      selectedValue: '.selected-value',
      optionsList: '.select-dropdown li'
    };
  }

  // Get element with error handling
  getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
    }
    return element;
  }

  // Get multiple elements
  getElements(selector) {
    return document.querySelectorAll(selector);
  }

  // Get element by ID (eliminates message chain)
  getById(id) {
    return this.getElement(`#${id}`);
  }

  // Get element by class (eliminates message chain)
  getByClass(className) {
    return this.getElement(`.${className}`);
  }

  // Get elements by class (eliminates message chain)
  getAllByClass(className) {
    return this.getElements(`.${className}`);
  }

  // Get element by attribute (eliminates message chain)
  getByAttribute(attribute, value) {
    return this.getElement(`[${attribute}="${value}"]`);
  }

  // Get parent element (eliminates message chain)
  getParent(element) {
    return element ? element.parentNode : null;
  }

  // Get child elements (eliminates message chain)
  getChildren(element) {
    return element ? Array.from(element.children) : [];
  }

  // Get first child (eliminates message chain)
  getFirstChild(element) {
    return element ? element.firstElementChild : null;
  }

  // Get last child (eliminates message chain)
  getLastChild(element) {
    return element ? element.lastElementChild : null;
  }

  // Get next sibling (eliminates message chain)
  getNextSibling(element) {
    return element ? element.nextElementSibling : null;
  }

  // Get previous sibling (eliminates message chain)
  getPreviousSibling(element) {
    return element ? element.previousElementSibling : null;
  }

  // Find element within context (eliminates message chain)
  findInContext(context, selector) {
    return context ? context.querySelector(selector) : null;
  }

  // Find all elements within context (eliminates message chain)
  findAllInContext(context, selector) {
    return context ? context.querySelectorAll(selector) : [];
  }

  // Check if element exists (eliminates message chain)
  exists(selector) {
    return !!this.getElement(selector);
  }

  // Check if element has class (eliminates message chain)
  hasClass(element, className) {
    return element ? element.classList.contains(className) : false;
  }

  // Add class to element (eliminates message chain)
  addClass(element, className) {
    if (element) {
      element.classList.add(className);
    }
  }

  // Remove class from element (eliminates message chain)
  removeClass(element, className) {
    if (element) {
      element.classList.remove(className);
    }
  }

  // Toggle class on element (eliminates message chain)
  toggleClass(element, className) {
    if (element) {
      element.classList.toggle(className);
    }
  }

  // Set element attribute (eliminates message chain)
  setAttribute(element, attribute, value) {
    if (element) {
      element.setAttribute(attribute, value);
    }
  }

  // Get element attribute (eliminates message chain)
  getAttribute(element, attribute) {
    return element ? element.getAttribute(attribute) : null;
  }

  // Remove element attribute (eliminates message chain)
  removeAttribute(element, attribute) {
    if (element) {
      element.removeAttribute(attribute);
    }
  }

  // Set element style property (eliminates message chain)
  setStyle(element, property, value) {
    if (element) {
      element.style[property] = value;
    }
  }

  // Get element style property (eliminates message chain)
  getStyle(element, property) {
    return element ? element.style[property] : null;
  }

  // Set element CSS text (eliminates message chain)
  setCssText(element, cssText) {
    if (element) {
      element.style.cssText = cssText;
    }
  }

  // Toggle dropdown visibility
  toggleDropdown(dropdownElement) {
    if (!dropdownElement) return;
    
    const content = this.getDropdownContent(dropdownElement);
    if (content) {
      const isVisible = this.getStyle(content, 'display') === 'block';
      this.setDropdownVisibility(content, !isVisible);
    }
  }

  // Get dropdown content element
  getDropdownContent(dropdownElement) {
    return this.findInContext(dropdownElement, this.dropdownSelectors.dropdownContent);
  }

  // Set dropdown visibility
  setDropdownVisibility(contentElement, isVisible) {
    this.setStyle(contentElement, 'display', isVisible ? 'block' : 'none');
  }

  // Hide all dropdowns
  hideAllDropdowns() {
    const dropdowns = this.getElements(this.dropdownSelectors.profile);
    dropdowns.forEach(dropdown => {
      const content = this.getDropdownContent(dropdown);
      this.setDropdownVisibility(content, false);
    });
  }

  // Setup dropdown event listeners
  setupDropdownListeners() {
    const profileDropdowns = this.getElements(this.dropdownSelectors.profile);
    
    profileDropdowns.forEach(dropdown => {
      this.addEventListener(dropdown, 'click', (event) => {
        event.stopPropagation();
        this.toggleDropdown(dropdown);
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const clickedDropdown = event.target.closest(this.dropdownSelectors.profile);
      if (!clickedDropdown) {
        this.hideAllDropdowns();
      }
    });
  }

  // Update authentication UI
  updateAuthUI(isAuthenticated) {
    const profileDropdown = this.getElement(this.dropdownSelectors.profile);
    const signUpLink = this.getElement(this.dropdownSelectors.signUpLink);
    const loginLink = this.getElement(this.dropdownSelectors.loginLink);

    if (isAuthenticated) {
      this.showElement(profileDropdown);
      this.hideElement(signUpLink);
      this.hideElement(loginLink);
    } else {
      this.hideElement(profileDropdown);
      this.showElement(signUpLink);
      this.showElement(loginLink);
    }
  }

  // Show element
  showElement(element) {
    this.setStyle(element, 'display', 'block');
  }

  // Hide element
  hideElement(element) {
    this.setStyle(element, 'display', 'none');
  }

  // Toggle element visibility
  toggleElement(element) {
    if (element) {
      const isVisible = this.getStyle(element, 'display') !== 'none';
      this.setStyle(element, 'display', isVisible ? 'none' : 'block');
    }
  }

  // Set element text content
  setTextContent(element, text) {
    if (element) {
      element.textContent = text;
    }
  }

  // Get element text content
  getTextContent(element) {
    return element ? element.textContent : '';
  }

  // Set element inner HTML
  setInnerHTML(element, html) {
    if (element) {
      element.innerHTML = html;
    }
  }

  // Get element inner HTML
  getInnerHTML(element) {
    return element ? element.innerHTML : '';
  }

  // Add event listener with error handling
  addEventListener(element, event, handler) {
    if (element) {
      element.addEventListener(event, handler);
    } else {
      console.warn(`Cannot add event listener to null element for event: ${event}`);
    }
  }

  // Remove event listener
  removeEventListener(element, event, handler) {
    if (element) {
      element.removeEventListener(event, handler);
    }
  }

  // Create element with attributes
  createElement(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  }

  // Append child with error handling
  appendChild(parent, child) {
    if (parent && child) {
      parent.appendChild(child);
    }
  }

  // Remove child with error handling
  removeChild(parent, child) {
    if (parent && child) {
      parent.removeChild(child);
    }
  }

  // Remove element from DOM
  removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  // Clear element content
  clearElement(element) {
    if (element) {
      element.innerHTML = '';
    }
  }

  // Check if element is visible
  isVisible(element) {
    return element && this.getStyle(element, 'display') !== 'none';
  }

  // Check if element is hidden
  isHidden(element) {
    return !this.isVisible(element);
  }

  // Get computed style
  getComputedStyle(element, property) {
    return element ? window.getComputedStyle(element)[property] : null;
  }

  // Get element dimensions
  getDimensions(element) {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right
    };
  }

  // Check if element is in viewport
  isInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Scroll element into view
  scrollIntoView(element, options = {}) {
    if (element) {
      element.scrollIntoView(options);
    }
  }

  // Focus element
  focusElement(element) {
    if (element) {
      element.focus();
    }
  }

  // Blur element
  blurElement(element) {
    if (element) {
      element.blur();
    }
  }

  // Get form data
  getFormData(formElement) {
    if (!formElement) return {};
    
    const formData = new FormData(formElement);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }

  // Set form data
  setFormData(formElement, data) {
    if (!formElement) return;
    
    Object.entries(data).forEach(([key, value]) => {
      const input = this.findInContext(formElement, `[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(value);
        } else if (input.type === 'radio') {
          if (input.value === value) {
            input.checked = true;
          }
        } else {
          input.value = value;
        }
      }
    });
  }

  // Get checked radio button value
  getCheckedRadioValue(name) {
    const checkedRadio = this.getElement(`input[name="${name}"]:checked`);
    return checkedRadio ? checkedRadio.value : null;
  }

  // Get checkbox value
  getCheckboxValue(selector) {
    const checkbox = this.getElement(selector);
    return checkbox ? checkbox.checked : false;
  }

  // Set checkbox value
  setCheckboxValue(selector, checked) {
    const checkbox = this.getElement(selector);
    if (checkbox) {
      checkbox.checked = Boolean(checked);
    }
  }

  // Get select value
  getSelectValue(selector) {
    const select = this.getElement(selector);
    return select ? select.value : null;
  }

  // Set select value
  setSelectValue(selector, value) {
    const select = this.getElement(selector);
    if (select) {
      select.value = value;
    }
  }

  // Get input value
  getInputValue(selector) {
    const input = this.getElement(selector);
    return input ? input.value : '';
  }

  // Set input value
  setInputValue(selector, value) {
    const input = this.getElement(selector);
    if (input) {
      input.value = value;
    }
  }
}

// Initialize services
const apiClient = new ApiClient();
const authService = new AuthService();
const pageState = new PageState();
const urlParamsService = new URLParamsService();
const paginationService = new PaginationService(pageState, urlParamsService);
const errorHandler = new ErrorHandler();
const ratingService = new RatingService(apiClient, errorHandler);
const ratingUIService = new RatingUIService(ratingService, errorHandler);
const cartService = new CartService(apiClient, errorHandler);
const domHelper = new DOMHelperService();

// Initialize DOM helpers
domHelper.setupDropdownListeners();

// Update authentication UI on page load
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  domHelper.updateAuthUI(!!token);
});

// Setup logout functionality
domHelper.addEventListener(domHelper.getElement('#logout-link'), 'click', function(event) {
  event.preventDefault();
  authService.logout().then(() => {
    window.location.href = '/Login/login.html';
  }).catch(error => {
    console.error('Error during logout:', error);
  });
});

// DOM Helper Functions to eliminate message chains
function getCheckedItems() {
  return domHelper.getElements(domHelper.commonSelectors.checkedItems);
}

function getSelectedCategories() {
  const checkedItems = getCheckedItems();
  return checkedItems.map(item => {
    const itemText = domHelper.findInContext(item, domHelper.commonSelectors.itemText);
    return domHelper.getTextContent(itemText);
  });
}

function setButtonText(count) {
  const btnText = domHelper.getElement(domHelper.commonSelectors.buttonText);
  domHelper.setInnerHTML(btnText, count > 0 ? `${count} selected` : 'Select');
}

function getSortingOption() {
  return domHelper.getElement(domHelper.commonSelectors.sortingOption);
}

function getCardsContainer() {
  return domHelper.getById('cards');
}

function updateSelectedCategoriesCount() {
  const checked = getCheckedItems();
  setButtonText(checked.length);
}

window.addEventListener('DOMContentLoaded', () => {
    // Initialize page state and UI from URL parameters
    urlParamsService.updatePageStateFromURL();
    urlParamsService.updateUIFromURL();
    
    const filterBtn = domHelper.getElement(domHelper.commonSelectors.filterBtn);
    const vegetarianCheckbox = domHelper.getById('is-vegetarian');
    
    domHelper.addEventListener(filterBtn, 'click', function() {
        const isVegetarian = domHelper.getCheckboxValue('#is-vegetarian');
        pageState.setVegetarian(isVegetarian);
        
        domHelper.addEventListener(vegetarianCheckbox, 'change', function() {
            pageState.setVegetarian(domHelper.getCheckboxValue('#is-vegetarian'));
        });
    
        const selectedCategories = getSelectedCategories();
        pageState.setSelectedCategories(selectedCategories);
        
        // Apply filters and fetch data
        paginationService.resetToFirstPage(); 
        fetchData(pageState.getPage());
    });

    fetchData(pageState.getPage());
});

function fetchData(pageNumber) {
    // Build parameters using the URL service
    const params = urlParamsService.buildApiParams();
    
    // Update URL with new parameters
    urlParamsService.updateURL(params);
    
    const cartDataMap = new Map();

    const getDishes = async () => {
        try {
            const data = await apiClient.get('/dish', params);
            paginationService.updateTotalPages(data.pagination.count);
            let cards = getCardsContainer();
            domHelper.clearElement(cards);

            const sortedDishes = data.dishes;

            const filteredDishes = sortedDishes.filter(dish => {
                const selectedCategories = pageState.getSelectedCategories();
                return selectedCategories.length === 0 || selectedCategories.includes(dish.category);
            });
            

            filteredDishes.forEach((dish) => {
                const card = domHelper.createElement('div', { className: 'card' });
                const image = domHelper.createElement('img', { src: dish.image });
                const container = domHelper.createElement('div', { className: 'container' });
                const name = domHelper.createElement('div', { className: 'name', textContent: dish.name });
                const category = domHelper.createElement('div', { className: 'category', textContent: `Category: ${dish.category}` });

                const ratingFieldset = ratingUIService.setupRatingUI(dish, card);

                // Create cart UI using the service
                const { addToCartBtn, cartSection } = cartService.createCartUI(dish.id, card);

                domHelper.appendChild(container, name);
                domHelper.appendChild(container, category);
                domHelper.appendChild(container, ratingFieldset);
                domHelper.appendChild(container, addToCartBtn);
                domHelper.appendChild(container, cartSection);

                domHelper.appendChild(card, image);
                domHelper.appendChild(card, container);

                domHelper.appendChild(cards, card);
            });

            paginationService.update();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    
    getDishes();
    
    // Get cart data using the service
    cartService.getCartData().then(cartData => {
        if (cartData) {
            console.log('Cart data loaded:', cartData);
        }
    });
}

// REMOVE THIS ENTIRE SECTION:
const selectbtn = document.querySelector(".select-btn");
const items = document.querySelectorAll(".item");

selectbtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectbtn.classList.toggle("open");
});

items.forEach((item) => {
    item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!e.target.classList.contains("checkbox")) {
            item.classList.toggle("checked");
        }

        let checked = document.querySelectorAll(".checked");
        let btnText = document.querySelector(".btn-text");

        if (checked && checked.length > 0) {
            btnText.innerHTML = `${checked.length} selected`;
        } else {
            btnText.innerHTML = "Select";
        }
    });
});

document.addEventListener("click", function (e) {
    if (!selectbtn.contains(e.target)) {
        selectbtn.classList.remove("open");
    }
});

const customSelect = document.querySelector(".custom-select");
const selectBtn = document.querySelector(".select-button");

const selectedValue = document.querySelector(".selected-value");
const optionsList = document.querySelectorAll(".select-dropdown li");

selectBtn.addEventListener("click", () => {
    customSelect.classList.toggle("active");
    selectBtn.setAttribute(
        "aria-expanded",
        selectBtn.getAttribute("aria-expanded") === "true" ? "false" : "true"
    );
});

optionsList.forEach((option) => {
    function handler(e) {
        if (e.type === "click" && e.clientX !== 0 && e.clientY !== 0) {
            const labelText = this.querySelector("label").textContent;
            selectedValue.textContent = labelText;
            e.stopPropagation();
        }
        if (e.key === "Enter") {
            selectedValue.textContent = this.textContent;
            e.stopPropagation();
        }
    }

    option.addEventListener("keyup", handler);
    option.addEventListener("click", handler);
});

document.addEventListener("click", function (e) {
    if (!customSelect.contains(e.target)) {
        customSelect.classList.remove("active");
        selectBtn.setAttribute("aria-expanded", "false");
    }
});



  
  
