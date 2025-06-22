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
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // Set rating for a dish
  async setRating(dishId, ratingScore) {
    try {
      await this.apiClient.postAuth(`/dish/${dishId}/rating?ratingScore=${ratingScore}`);
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
      return await this.apiClient.getAuth(`/dish/${dishId}/rating/check`);
    } catch (error) {
      console.error('Error checking rating permission:', error);
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
                console.error('Failed to set rating:', error);
              }
            }
          });
        }
      })
      .catch(error => {
        console.error('Error enabling rating:', error);
      });
  }
}

// Cart Service to centralize cart-related API operations
class CartService {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.cartDataMap = new Map();
  }

  // Add dish to cart
  async addToCart(dishId) {
    try {
      await this.apiClient.postAuth(`/basket/dish/${dishId}`);
      console.log(`Dish ${dishId} added to cart successfully`);
      return true;
    } catch (error) {
      console.error('Error adding dish to cart:', error);
      throw error;
    }
  }

  // Remove dish from cart
  async removeFromCart(dishId) {
    try {
      await this.apiClient.deleteAuth(`/basket/dish/${dishId}?increase=true`);
      console.log(`Dish ${dishId} removed from cart successfully`);
      return true;
    } catch (error) {
      console.error('Error removing dish from cart:', error);
      throw error;
    }
  }

  // Get cart data
  async getCartData() {
    try {
      const cartData = await this.apiClient.getAuth('/basket');
      return cartData;
    } catch (error) {
      console.error('Error fetching cart data:', error);
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
      console.error('Failed to add to cart:', error);
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
      console.error('Failed to decrease quantity:', error);
    }
  }
}

// Initialize services
const apiClient = new ApiClient();
const authService = new AuthService();
const urlParamsService = new URLParamsService();
const ratingService = new RatingService(apiClient);
const cartService = new CartService(apiClient);

// Initialize page state
const pageState = new PageState();

// Initialize pagination service
const paginationService = new PaginationService(pageState, urlParamsService);

// DOM Helper Functions to eliminate message chains
function getCheckedItems() {
  return document.querySelectorAll('.list-items .item.checked');
}

function getSelectedCategories() {
  return Array.from(getCheckedItems()).map(item => item.querySelector('.item-text').textContent);
}

function setButtonText(count) {
  const btnText = document.querySelector('.btn-text');
  btnText.innerHTML = count > 0 ? `${count} selected` : 'Select';
}

function getSortingOption() {
  return document.querySelector('.select-dropdown input[type="radio"]:checked');
}

function getCardsContainer() {
  return document.getElementById('cards');
}

function updateSelectedCategoriesCount() {
  const checked = getCheckedItems();
  setButtonText(checked.length);
}

window.addEventListener('DOMContentLoaded', () => {
    // Initialize page state and UI from URL parameters
    urlParamsService.updatePageStateFromURL();
    urlParamsService.updateUIFromURL();
    
    document.querySelector('.filter-btn').addEventListener('click', function() {
        pageState.setVegetarian(document.getElementById('is-vegetarian').checked);
        document.getElementById('is-vegetarian').addEventListener('change', function() {
            pageState.setVegetarian(this.checked);
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
            cards.innerHTML = '';

            const sortedDishes = data.dishes;

            const filteredDishes = sortedDishes.filter(dish => {
                const selectedCategories = pageState.getSelectedCategories();
                return selectedCategories.length === 0 || selectedCategories.includes(dish.category);
            });
            

            filteredDishes.forEach((dish) => {
                const card = document.createElement('div');
                card.classList.add("card");
                const image = document.createElement('img');
                image.src = dish.image;
                const container = document.createElement('div');
                container.classList.add('container');
                const name = document.createElement('div');
                name.classList.add('name');
                name.textContent = dish.name;
                const category = document.createElement('div');
                category.classList.add('category');
                category.textContent = `Category: ${dish.category}`;

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

                const fullStars = Math.floor(dish.rating);
                const halfStar = dish.rating - fullStars >= 0.5;

                const ratingInputs = ratingFieldset.querySelectorAll('input');
                const fullStarIndex = 20 - fullStars * 2;

                if(ratingInputs[fullStarIndex]) {
                    ratingInputs[fullStarIndex].checked = true;
                }

                if (halfStar && ratingInputs[fullStarIndex - 1]) {
                    ratingInputs[fullStarIndex - 1].checked = true;
                }

                // Enable rating functionality using the service
                ratingService.enableRatingForDish(dish.id, ratingFieldset);

                // Create cart UI using the service
                const { addToCartBtn, cartSection } = cartService.createCartUI(dish.id, card);

                container.appendChild(name);
                container.appendChild(category);
                container.appendChild(ratingFieldset);
                container.appendChild(addToCartBtn);
                container.appendChild(cartSection);

                card.appendChild(image);
                card.appendChild(container);

                cards.appendChild(card);
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

  document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const profileDropdown = document.querySelector('.select-dropdown1');
    const signUpLink = document.querySelector('header nav ul li:nth-child(4)');
    const loginLink = document.querySelector('header nav ul li:nth-child(5)');

    if (token) {
        // User is logged in
        profileDropdown.style.display = 'block';
        signUpLink.style.display = 'none';
        loginLink.style.display = 'none';
    } else {
        // User is not logged in
        profileDropdown.style.display = 'none';
        signUpLink.style.display = 'block';
        loginLink.style.display = 'block';
    }
});

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
