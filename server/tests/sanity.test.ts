import { describe, it, expect } from 'vitest';

//function to test

const add = (a: number, b: number) => a + b;

//describe
describe('addition', () => {
  it('adds numbers correctly: Sanity check. If this fails, something is up with vitest, and check commands run.', () => {
    expect(add(2, 3)).toBe(5);
  });
});

//test asynchronous code
const fetchData = () => Promise.resolve('data');

it('fetches data async. If this fails, vitest is wrong. Check versions, this is how we test actual data recieving.', async () => {
  const data = await fetchData();
  expect(data).toBe('data');
});

//test data-driven
//god i wish there was an easier way to do this, etc.
const isEven = (n: number) => n % 2 === 0;

it.each([
  [2, true],
  [3, false],
  [4, true],
])('test each, this should never fail, check vitest if so.', (input, expected) => {
  expect(isEven(input)).toBe(expected);
});
