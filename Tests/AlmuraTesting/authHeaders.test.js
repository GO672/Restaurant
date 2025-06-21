import { buildAuthHeaders } from '../src/auth';
import { mockLocalStorage } from './testUtils';

describe('Auth Headers', () => {
  beforeAll(() => {
    global.localStorage = mockLocalStorage();
  });

  test('includes correct auth token', () => {
    localStorage.setItem('token', 'test-123');
    const headers = buildAuthHeaders();
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-123'
    });
  });
});
