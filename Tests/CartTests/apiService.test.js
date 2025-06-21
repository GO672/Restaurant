describe('API Header Data Clumps Tests', () => {
  const testToken = "test-token-123";

  beforeEach(() => {
    localStorage.getItem.mockReturnValue(testToken);
  });

  const verifyHeaders = (headers) => {
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    });
  };

  test('addToCart headers', async () => {
    await addToCart(1);
    const call = fetch.mock.calls[0][1];
    verifyHeaders(call.headers);
  });

  test('createOrder headers', async () => {
    await createOrderButton.click();
    const call = fetch.mock.calls[0][1];
    verifyHeaders(call.headers);
  });
});
