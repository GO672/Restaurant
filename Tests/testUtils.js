export const mockLocalStorage = () => {
  const storage = {};
  return {
    getItem: jest.fn((key) => storage[key]),
    setItem: jest.fn((key, value) => { storage[key] = value; }),
    clear: jest.fn(() => { Object.keys(storage).forEach(key => delete storage[key]; })
  };
};

export const simulateRatingClick = (ratingElement, stars) => {
  ratingElement.value = stars;
  ratingElement.dispatchEvent(new Event('change'));
};
