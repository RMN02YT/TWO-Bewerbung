/* eslint-disable require-jsdoc */
import {test, expect} from '@jest/globals';

function sum(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('subtracts 2 - 1 to equal 1', () => {
  expect(subtract(2, 1)).toBe(1);
});
test('expects true to be true', () => {
  expect(true).toBe(true);
});
