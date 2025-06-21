import { initializeForm } from '../src/orderCart';

describe('Order Submission Flow', () => {
  it('loads profile when token exists', () => {
    localStorage.getItem.mockReturnValue('valid-token');
    initializeForm();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/account/profile'),
      expect.anything()
    );
  });
});
