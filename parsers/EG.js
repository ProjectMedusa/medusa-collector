/* eslint-disable class-methods-use-this */
const { Parser, phoneticAlphabet } = require('../../medusa-collector-utils');

const letterNumbers = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  ZERO: 0,
};

class EG extends Parser {
  parseIntersectionFrom(line) {
    if (line === undefined) {
      // wrong thing, TODO
      return null;
    }
    let result = line.toUpperCase();
    Object.entries(letterNumbers).forEach(([letter, number]) => {
      result = result.replace(letter, number);
    });

    if (/runway/i.test(result)) {
      return `RWY ${result.match(/runway (\d\d)/i)[1]}`;
    }
    if (/Taxiway|intersection/i.test(result)) {
      const output = phoneticAlphabet
        .stringify(result)
        // eslint-disable-next-line max-len
        // .match(/Take(?:-|\s+)off from (?:intersections?|Taxiway|Taxiways)? (?:with|of) (?:Holding Point|Point|Holding|Hold|Taxiway|)?\s?((?:[A-Z] and [A-Z])|([A-Z].*))+/i)[1]
        .match(/.*(?:taxiways?|holds?|links?|with) ([A-Z0-9]+.*?)(?:\.)?/i)[1]
        .replace(' ', '');
      return /and/.test(output) ? output.split('AND') : output;
    }
    return line;
  }

  parseRunway([runway, rawTora, rawToda, rawAsda, rawLda, remarks]) {
    const extractFirstSpan = (html, selector = 'span') => html.querySelectorAll(selector)[0]?.innerHTML;

    const ident = extractFirstSpan(runway);
    const tora = extractFirstSpan(rawTora);
    const toda = extractFirstSpan(rawToda);
    const asda = extractFirstSpan(rawAsda);
    const lda = extractFirstSpan(rawLda);

    const dataObject = {
      tora, toda, asda,
    };

    // check if the runway ident is already in array
    // if not, it's a runway, if yes, it's an intersection

    const index = this.results.findIndex(({ ident: resultIdent }) => resultIdent === ident);
    if (index > -1) {
      // exists, so create an intersection
      const intersection = {
        intx: this.parseIntersectionFrom(extractFirstSpan(remarks)),
        ...dataObject,
      };
      const intersections = [...this.results[index].intersections, intersection];
      this.results[index] = { ...this.results[index], intersections };
    } else {
      // does not exist, so create a runway
      this.results.push({
        ident, ...dataObject, lda, intersections: [],
      });
    }
  }

  runwayRows(rows) {
    let runwayRows;
    rows.forEach((row) => {
      runwayRows = row.querySelectorAll('td');
      this.parseRunway(runwayRows);
    });
    this.save();
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
  ParserImplementation: EG,
  parseAerodromeString,
};
