describe('API Header Data Clumps', () => {
  const testToken = "test-token-123";

  beforeEach(() => {
    localStorage.getItem.mockReturnValue(testToken);
  });

  test('fetchAndDisplayOrders headers', async () => {
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    await fetchAndDisplayOrders();
    expect(fetch.mock.calls[0][1].headers).toEqual({
      'Accept': 'application/json',
      'Authorization': `Bearer ${testToken}`
    });
  });

  test('order confirmation headers', async () => {
    document.body.innerHTML = '<div id="orders-container"></div>';
    displayOrders([{ id: 1, status: "InProcess" }]);
    
    fetch.mockResolvedValue({ ok: true });
    await document.querySelector('button').click();
    
    expect(fetch.mock.calls[0][1].headers).toEqual({
      'accept': 'application/json',
      'Authorization': `Bearer ${testToken}`
    });
  });
});
