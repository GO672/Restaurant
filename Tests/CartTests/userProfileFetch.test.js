import { fetchUserProfile } from '../src/orderCart';

describe('Profile Fetch', () => {
  it('updates address field on successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ address: "123 Test St" })
    });
    await fetchUserProfile('test-token');
    expect(document.getElementById('address').value).toBe('123 Test St');
  });
});
