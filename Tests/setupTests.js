// Global test setup
require('@testing-library/jest-dom');

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

global.localStorage = localStorageMock;

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Only mock window.location methods, not properties
window.location.assign = jest.fn();
window.location.replace = jest.fn();
window.location.reload = jest.fn();

// Mock window.alert
global.alert = jest.fn();

// Mock window.confirm
global.confirm = jest.fn();

// Mock window.prompt
global.prompt = jest.fn();

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    replaceState: jest.fn(),
    pushState: jest.fn()
  },
  writable: true
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock URLSearchParams
global.URLSearchParams = URLSearchParams;

// Helper function to create mock dish data
global.createMockDish = (id, name, category, price, rating) => ({
  id,
  name,
  description: 'Test description',
  price,
  image: 'https://example.com/dish-image.jpg',
  vegetarian: false,
  rating,
  category
});

// Helper function to create mock cart item
global.createMockCartItem = (id, name, amount, price) => ({
  id,
  name,
  amount,
  price,
  totalPrice: amount * price,
  image: 'https://example.com/cart-item-image.jpg'
});

// Helper function to create mock order
global.createMockOrder = (id, status, deliveryTime, address) => ({
  id,
  status,
  deliveryTime,
  address,
  orderTime: '2024-01-15T10:00:00Z',
  items: [
    { id: 1, name: 'Pizza', amount: 2, price: 100 },
    { id: 2, name: 'Salad', amount: 1, price: 50 }
  ]
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});