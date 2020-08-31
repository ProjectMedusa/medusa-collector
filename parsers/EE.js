/* eslint-disable radix */
const { Parser } = require('@project-medusa/collector-utils');

class EE extends Parser {
  parseRunway([runway, rawTora, rawToda, rawAsda, rawLda]) {
    const tora = parseInt(rawTora.innerHTML);
    const toda = parseInt(rawToda.innerHTML);
    const asda = parseInt(rawAsda.innerHTML);
    const lda = parseInt(rawLda.innerHTML);

    // it's always a runway so always push as intx are handled in a diff method
    this.results.push({
      ident: runway.innerHTML, tora, toda, asda, lda, intx: [], slope: null,
    });
  }

  parseIntersection(intx) {
    const index = this.results.findIndex(({ ident }) => ident === this.currentRunway);
    let intxObj;

    if (/[0-9][0-9](?:[L|R|C])?/.test(intx[0].innerHTML)) {
      // first arr entry matches a runway ident pattern
      // means that intx[1] = intx ident
      const [, ident, toda, tora, asda] = intx;
      intxObj = {
        ident: ident.innerHTML,
        tora: tora.innerHTML,
        toda: toda.innerHTML,
        asda: asda.innerHTML,
      };
    } else {
      // else, we're on a second row, and so intx[0] = intx ident
      const [ident, toda, tora, asda] = intx;
      intxObj = {
        ident: ident.innerHTML,
        tora: tora.innerHTML,
        toda: toda.innerHTML,
        asda: asda.innerHTML,
      };
    }

    // convert intxObj distance formats
    Object.entries(intxObj).forEach(([key, value]) => {
      if (key !== 'ident') intxObj[key] = parseInt(value);
    });

    if (intxObj.ident.includes('THR')) {
      // intx is a displaced threshold
      this.results[index].intx.push({
        ...intxObj,
        ident: 'DTHR',
      });
    } else {
      // intx is a taxiway (normal intx)
      const ident = intxObj.ident.match(/.*?(?:<\/acronym>)?(?:&nbsp;|\s)([A-Z0-9]+)(?:&nbsp;|\s)[-–].*/)[1];

      this.results[index].intx.push({
        ...intxObj,
        ident,
      });
    }
  }

  runwayRows(rows) {
    rows.forEach((row) => {
      const runwayRows = row.querySelectorAll('td');

      this.parseRunway(runwayRows);
    });
  }

  intxRows(rows) {
    rows.forEach((row) => {
      const intxRows = row.querySelectorAll('td');
      if (/[0-9][0-9](?:[L|R|C])?/.test(intxRows[0].innerHTML)) {
        // eslint-disable-next-line prefer-destructuring
        this.currentRunway = intxRows[0].innerHTML;
      }
      this.parseIntersection(intxRows);
    });
  }

  parseSlopes(string) {
    return string
      .replace(/%/g, '')
      .replace(/ /g, '')
      .split('/')
      .map((item) => parseFloat(item));
  }

  parseDistances(string) {
    const result = string
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .replace(/ <span>m<\/span>/g, '');

    return /\//.test(result)
      ? result.split(' / ').map((item) => parseInt(item))
      : result.split(' ').map((item) => parseInt(item));
  }

  runwayCharacteristics(rows) {
    rows.forEach((row) => {
      const [runway, rawSlope] = row.querySelectorAll('td');

      const index = this.results.findIndex(({ ident }) => ident === runway.innerHTML);

      let weightedAverage;
      if (rawSlope.innerHTML !== '<div><span><span>NIL</span></span></div>') {
        // checked that the slopes are present in the table, continue

        const [, rawSlopes, rawDistances] = rawSlope.innerHTML
          .replace(/<\/?acronym.*?>/g, '')
          .replace(/&nbsp;/g, ' ')
          .match(/([-+0-9.%/\s]+)(?:<br.*>)?(\(.*\))/);

        const runwayLen = this.results[index].tora;

        const slopes = this.parseSlopes(rawSlopes);
        const distances = this.parseDistances(rawDistances);

        weightedAverage = slopes
          .reduce((acc, slope, i) => (slope * distances[i]) + acc, 0) / runwayLen;
      }

      this.results[index] = {
        ...this.results[index],
        slope: Math.round((weightedAverage + Number.EPSILON) * 100) / 100,
      };
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
  ParserImplementation: EE,
  parseAerodromeString,
};
