const { expect } = require('chai');
const Utils = require('../src/utils');

describe('> utils', () => {
  describe('> sanitizePriceValue', () => {
    it('should return a number', (done) => {
      const str = '123445';
      const res = Utils.sanitizePriceValue(str);

      expect(res).to.equal(123445);
      done();
    });

    it('should remove the euro symbol ("€") from a string', (done) => {
      const str = '€€€56€€€€09€';
      const res = Utils.sanitizePriceValue(str);

      expect(res).to.equal(5609);
      done();
    });

    it('should replace delimiter in the string', (done) => {
      const str = '€€€56,09€';
      const res = Utils.sanitizePriceValue(str);

      expect(res).to.equal(56.09);
      done();
    });

    it('should remove "&nbsp;" characters from a string', (done) => {
      const str = '€€€56,09€&nbsp;';
      const res = Utils.sanitizePriceValue(str);

      expect(res).to.equal(56.09);
      done();
    });
  });

  describe('> formatDateValue', () => {
    it("should return an empty string if the date doesn't match the predefined date format", (done) => {
      const date = '';
      const res = Utils.formatDateValue(date);

      expect(res).to.equal('');
      done();
    });

    it('should return an empty string if the date passed is null', (done) => {
      const date = null;
      const res = Utils.formatDateValue(date);

      expect(res).to.equal('');
      done();
    });

    it('should return an empty string if the date passed is invalid', (done) => {
      const date = '2019-02-29';
      const res = Utils.formatDateValue(date);

      expect(res).to.equal('');
      done();
    });

    it('should format a date into "YYYY-MM-DD HH:mm:ss.SSSZ" date format', (done) => {
      const date = 'Dimanche 20 Janvier 2019';
      const res = Utils.formatDateValue(date);

      expect(res).to.equal('2019-01-20 00:00:00.000Z');
      done();
    });
  });

  describe('> replaceTimeDelimiter', () => {
    it('should return the same string if no delimiter found', (done) => {
      const str = 'foobar';
      const res = Utils.replaceTimeDelimiter(str);

      expect(res).to.be.a.string;
      expect(res).to.equal('foobar');
      done();
    });

    it('should replace the delimiter of a time string', (done) => {
      const timeStr = '00h00';
      const res = Utils.replaceTimeDelimiter(timeStr);

      expect(res).to.be.a.string;
      expect(res).to.equal('00:00');
      done();
    });
  });
});
