const { readFile, writeFile } = require('fs');
const HtmlSanitizer = require('./src/htmlSanitizer');
const Scraper = require('./src/scraper');

readFile('./public/test.html', (err, data) => {
  if (err) {
    return new Error(err);
  }

  //
  const bufferString = data.toString('utf8');

  //
  const sanitizedHtml = HtmlSanitizer.sanitize(bufferString);

  const scraper = new Scraper(sanitizedHtml);
  const res = scraper.generate();

  writeFile('./public/test-result.json', JSON.stringify(res), (error) => {
    if (error) {
      return new Error(error);
    }
  });
});
