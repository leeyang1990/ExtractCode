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
  describe('#filterFileName()', function() {
    it('', ()=> {
        const excludeLine = ['a.ts','b.ts'];
        const src = [
            `C:/Users/pc/project/a.ts`,
            `C:/Users/pc/project/b.ts`,
            `C:/Users/pc/project/c.ts`
        ];
        const result = main.filterFileName(src,excludeLine);
      assert.equal(result[0], `C:/Users/pc/project/c.ts`);
    });
  });
  describe('#filterFilePath()', function() {
    it('', ()=> {
        const excludeLine = ['C:/Users/pc/project/a.ts','C:/Users/pc/project/b.ts'];
        const src = [
            `C:/Users/pc/project/a.ts`,
            `C:/Users/pc/project/b.ts`,
            `C:/Users/pc/project/c.ts`
        ];
        const result = main.filterFilePath(src,excludeLine);
      assert.equal(result[0], `C:/Users/pc/project/c.ts`);
    });
  });
});