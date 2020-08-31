/* eslint-disable radix */
const { Parser } = require('../../medusa-collector-utils');

class EN extends Parser {
  parseRunway([runway, rawTora, rawToda, rawAsda, rawLda]) {
    const extractFirstSpan = (el) => el.querySelector('span').innerHTML;

    const ident = extractFirstSpan(runway);
    const tora = parseInt(extractFirstSpan(rawTora));
    const toda = parseInt(extractFirstSpan(rawToda));
    const asda = parseInt(extractFirstSpan(rawAsda));
    const lda = parseInt(extractFirstSpan(rawLda));

    this.results.push({
      ident, tora, toda, asda, lda, slope: 0, intx: [],
    });
  }

  runwayRows(rows) {
    rows.forEach((row) => {
      const runwayRows = row.querySelectorAll('td');
      this.parseRunway(runwayRows);
    });
  }

  parseIntx(data) {
    // const extractFirstSpan = (el) => el.querySelector('span').innerHTML;

    data.forEach((a) => {
      console.log(a.innerHTML);
    });
  }

  intxRows(rows) {
    rows.forEach((row) => {
      const intxRows = row.querySelectorAll('td');
      this.parseIntx(intxRows);
    });
  }

  runwayCharacteristics() {
    // apparently we do not have any slope data, so do nothing :(

    // this.save()
  }
}

function parseAerodromeString(line) {
  const rx = new RegExp(`AD-2.(${this.aoi}[A-Z][A-Z])details`);
  const id = line.getAttribute('id');
  if (rx.test(id)) {
    const match = id.match(rx);
    return match[1];
  }
  return false;
}

module.exports = {
  ParserImplementation: EN,
  parseAerodromeString,
};
