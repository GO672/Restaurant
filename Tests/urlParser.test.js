import { parseURLParams } from '../src/utils';

describe('parseURLParams', () => {
  test('parses multiple category values', () => {
    const testUrl = new URL('http://test.com?categories=meat&categories=dairy');
    const result = parseURLParams(testUrl);
    expect(result.categories).toEqual(['meat', 'dairy']);
  });

  test('handles missing parameters', () => {
    const testUrl = new URL('http://test.com');
    const result = parseURLParams(testUrl);
    expect(result).toEqual({});
  });
});
