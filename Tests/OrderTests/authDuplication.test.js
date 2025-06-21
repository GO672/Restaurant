describe('Token Validation Duplication', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    console.error = jest.fn();
  });

  test('fetchAndDisplayOrders handles missing token', async () => {
    await fetchAndDisplayOrders();
    expect(console.error).toHaveBeenCalledWith('No token found in local storage.');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('getCartData handles missing token', () => {
    getCartData();
    expect(console.error).toHaveBeenCalledWith('No token found in localStorage.');
    expect(fetch).not.toHaveBeenCalled();
  });
});
