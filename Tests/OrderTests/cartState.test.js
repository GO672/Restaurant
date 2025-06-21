describe('Temporary Field amount_DISh', () => {
  beforeEach(() => {
    amount_DISh = 0; // Reset temporary variable
  });

  test('accumulates amounts unpredictably', () => {
    const testData = [
      { amount: 2 },
      { amount: 3 }
    ];
    
    // Simulate multiple calls
    getCartData(testData);
    getCartData(testData);
    
    expect(amount_DISh).toBe(10); // 2+3 = 5 per call
  });
});
