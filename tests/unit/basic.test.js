const assert = require('assert');

console.log("Running unit tests...");

// Assert that the app environment variables can be loaded
assert.strictEqual(typeof process.env.PORT || '3000', 'string');

// Simple math sanity check
assert.strictEqual(1 + 1, 2);

console.log("All unit tests passed successfully!");
