import { handleRatingChange } from '../src/ratings';
import { mockLocalStorage } from './testUtils';

jest.mock('../src/api', () => ({
  postRating: jest.fn()
}));

describe('Rating System', () => {
  beforeAll(() => {
    global.localStorage = mockLocalStorage();
    localStorage.setItem('token', 'test-token');
  });

  test('sends correct rating to API', async () => {
    const mockEvent = {
      target: { value: '4.5' }
    };
    await handleRatingChange(42, mockEvent);
    expect(require('../src/api').postRating)
      .toHaveBeenCalledWith(42, 4.5, 'test-token');
  });
});
