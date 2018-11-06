import { testProp, fc } from '../lib/ava-fast-check';

const delay = duration =>
  new Promise(resolve => {
    setTimeout(() => resolve(), duration);
  });

// testProp

testProp('should pass on truthy synchronous property', [fc.string(), fc.string(), fc.string()], (a, b, c) => {
  return `${a}${b}${c}`.includes(b);
});
testProp('should pass on truthy asynchronous property', [fc.nat(), fc.string()], async (a, b) => {
  await delay(0);
  return typeof a === 'number' && typeof b === 'string';
});
testProp('should fail on falsy synchronous property', [fc.boolean()], a => a);
testProp('should fail on falsy asynchronous property', [fc.nat()], async a => {
  await delay(0);
  return typeof a === 'string';
});
testProp('should fail with seed=4242 and path="25"', [fc.constant(null)], () => false, { seed: 4242, path: '25' });

// testProp.failing

testProp.failing('should pass as the property fails', [fc.boolean()], a => a);
testProp.failing('should fail as the property passes', [fc.boolean()], a => a || !a);

// testProp.skip

testProp.skip('should never be executed', [fc.boolean()], a => a, { seed: 48 });

// testProp.serial

// Test that one serial run is after the other
let serialRun = false;
testProp.serial("should run first", [fc.boolean()], async a => {
  serialRun = true;
  await delay(0);
  return a == a;
});
testProp.serial("should run after", [fc.boolean()], async a => {
  return a == a && serialRun;
});

// Test that each execution of a test is run serially (and in order)
let runs = 0;
testProp.serial("should run serially", [fc.boolean()], async a => {
  let run = runs++;
  delay(a ? 1 : 0);
  return a == a && runs == (run + 1);
});
