import { showNotification } from '../src/orderCart';

describe('Notifications', () => {
  jest.useFakeTimers();

  it('auto-removes after specified duration', () => {
    showNotification('Test', 1000);
    jest.advanceTimersByTime(1000);
    expect(document.querySelector('.notification')).toBeNull();
  });
});
