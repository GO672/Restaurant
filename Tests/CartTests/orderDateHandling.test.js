import { setDefaultDate } from '../src/orderCart';
import 'jest-date-mock';

describe('Date Handling', () => {
  it('sets tomorrows date in YYYY-MM-DDTHH:MM format', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T12:00:00'));
    setDefaultDate();
    expect(document.getElementById('Date').value).toBe('2024-01-02T12:00');
  });
});
