const { expect } = require('chai');
const sinon = require('sinon');
const HtmlSanitizer = require('../src/htmlSanitizer');

describe('> htmlSanitizer', () => {
  describe('> removeEolChars', () => {
    it('should remove all EOL characters ("\\r\\n") from a string', (done) => {
      const str = '\\r\\nhello\\r\\n';
      const res = HtmlSanitizer.removeEolChars(str);

      expect(res).to.be.a.string;
      expect(res).to.equal('hello');
      done();
    });
  });

  describe('> trimSpaces', () => {
    it('should trim off spaces from a string', (done) => {
      const str = '<div>                        <span';
      const res = HtmlSanitizer.trimSpaces(str);

      expect(res).to.be.a.string;
      expect(res).to.equal('<div><span');
      done();
    });
  });

  describe('> normalizeQuotes', () => {
    it('should normalize escaped double quotes into double quotes', (done) => {
      const str = `\"hello\"`;
      const res = HtmlSanitizer.trimSpaces(str);

      expect(res).to.be.a.string;
      expect(res).to.equal('"hello"');
      done();
    });
  });

  describe('> sanitize', () => {
    let removeEolCharsSpy = null;
    let trimSpacesSpy = null;
    let normalizeQuotesSpy = null;

    beforeEach(() => {
      removeEolCharsSpy = sinon.spy(HtmlSanitizer, 'removeEolChars');
      trimSpacesSpy = sinon.spy(HtmlSanitizer, 'trimSpaces');
      normalizeQuotesSpy = sinon.spy(HtmlSanitizer, 'normalizeQuotes');
    });

    afterEach(() => {
      removeEolCharsSpy.restore();
      trimSpacesSpy.restore();
      normalizeQuotesSpy.restore();
    });

    it('should return a sanitized string', (done) => {
      const strToSanitize = `<div>\\r\\n    <div class=\\"some-class\\">\\r\\n   </div></div>`;
      const res = HtmlSanitizer.sanitize(strToSanitize);

      expect(removeEolCharsSpy.calledOnce).to.equal(true);
      expect(trimSpacesSpy.calledOnce).to.equal(true);
      expect(normalizeQuotesSpy.calledOnce).to.equal(true);
      expect(res).to.be.a.string;
      expect(res).to.equal(`<div><div class="some-class"></div></div>`);
      done();
    });
  });
});
