export const assert = (condition : boolean, msg : string = '') => {
  if (!condition) {
    throw Error(msg ? msg : 'Assertion failed');
  }
};