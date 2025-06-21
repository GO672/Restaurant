describe('Token Validation Duplication Tests', () => {
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
    global.localStorage.getItem.mockReturnValue(null);
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // Generic test for any function needing auth
  const testAuthRequirement = (func) => async () => {
    await func();
    expect(console.error).toHaveBeenCalledWith('No token found');
    expect(fetch).not.toHaveBeenCalled();
  };

  test('addToCart requires auth', testAuthRequirement(() => 
    addToCart(1)));

  test('removeItemFromCart requires auth', testAuthRequirement(() => 
    removeItemFromCart(1, {})));

  test('fetchUserProfile requires auth', testAuthRequirement(() => 
    fetchUserProfile()));
});
