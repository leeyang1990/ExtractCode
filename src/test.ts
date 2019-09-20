import assert from 'assert';
import * as main from './index';
describe('main', function() {
  describe('#filterLines()', function() {
    it('', ()=> {
        const excludeLine = ['import '];
        const src = [
            `import * as fs from 'fs-extra';`,
            `const officegen = require('officegen');`,
            `import walk from 'walk-sync';`
        ];
        const result = main.filterLines(src,excludeLine);
      assert.equal(result[0], `const officegen = require('officegen');`);
    });
  });
});