import { add, dec, inc } from '../src';

describe('add', () => {
  it('should return 3', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(4, -1)).toBe(3);
    expect(add(-4, 7)).toBe(3);
  });
});

describe('inc', () => {
  it('should return 3', () => {
    expect(inc(2)).toBe(3);
  });
});

describe('dec', () => {
  it('should return 3', () => {
    expect(dec(4)).toBe(3);
  });
});
