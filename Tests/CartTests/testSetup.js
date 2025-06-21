import { JSDOM } from 'jsdom';

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <input id="Date" type="datetime-local">
      <input id="address">
      <div id="cart-items-container"></div>
      <div class="delivery-container"></div>
      <div class="cart-number"></div>
      <button class="delivery-container button"></button>
    </body>
  </html>
`);

global.document = dom.window.document;
global.window = dom.window;
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
global.fetch = jest.fn();
