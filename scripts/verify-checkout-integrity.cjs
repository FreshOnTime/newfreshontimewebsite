/* eslint-disable @typescript-eslint/no-require-imports -- Node bootstrap installs TS and path resolution before loading the verification script. */
// Explicitly opt in to a disposable local database; never inherit DATABASE_URL.
const url = new URL(process.env.CHECKOUT_TEST_DATABASE_URL || '');
if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !/^checkout_test_[a-z0-9_]+$/.test(url.searchParams.get('schema') || '')) {
  throw new Error('CHECKOUT_TEST_DATABASE_URL must use localhost and a checkout_test_* schema');
}
process.env.DATABASE_URL = url.toString();
process.env.JWT_SECRET = 'checkout-integration-only-secret';
const Module = require('module');
const path = require('path');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith('@/') ? path.join(__dirname, '..', name.slice(2)) : name, ...args);
};
require('esbuild-register');
require('./verify-checkout-integrity.ts');
