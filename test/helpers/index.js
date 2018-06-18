import { describe, it } from 'mocha';
import moment from 'moment';
import { expect, should } from 'chai';
import glob from 'glob';
import path from 'path';

const projectFiles = glob.sync('*.js', {
  cwd: path.resolve(__dirname, '../../'),
  matchBase: true,
  absolute: true,
  ignore: [
    'index.js',
    'node_modules/**',
    'coverage/**',
    'test/**',
    'helpers/**'
  ]
});

// get all exports in project files for test
// ensure that project has no named export collision as this would result
// in functions being over-written.
module.exports = projectFiles.map(file => require(file))
  .reduce((fileA, fileB) => {
    return { ...module.exports, ...fileA, ...fileB }
  }, {});

module.exports = {
  ...module.exports,
  describe,
  it,
  expect,
  should: should(),
  moment
};
