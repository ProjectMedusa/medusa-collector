/* eslint-disable radix */
/* eslint-disable class-methods-use-this */
const { Parser } = require('../../medusa-collector-utils');

class EE extends Parser {
  parseRunway([runway, rawTora, rawToda, rawAsda, rawLda]) {
    const tora = parseInt(rawTora.innerHTML);
    const toda = parseInt(rawToda.innerHTML);
    const asda = parseInt(rawAsda.innerHTML);
    const lda = parseInt(rawLda.innerHTML);

    // it's always a runway so always push as intx are handled in a diff method
    this.results.push({
      ident: runway.innerHTML, tora, toda, asda, lda, intx: [],
    });
  }

  parseIntersection(intx, currentRunway) {
    const index = this.results.findIndex(({ ident }) => ident === currentRunway);
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
      console.log(intxObj.ident);
      const ident = intxObj.ident.match(/.*?(?:<\/acronym>)?(?:&nbsp;|\-)([A-Z0-9]+)(?:&nbsp;|\s)[-–].*/)[1];

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
    let currentRunway;

    rows.forEach((row) => {
      const intxRows = row.querySelectorAll('td');
      if (/[0-9][0-9](?:[L|R|C])?/.test(intxRows[0].innerHTML)) {
        // eslint-disable-next-line prefer-destructuring
        currentRunway = intxRows[0].innerHTML;
      }
      this.parseIntersection(intxRows, currentRunway);
    });
  }

  runwayCharacteristics(rows) {
    // rows.forEach((row) => {
    //   const [runway, rawSlope] = row.querySelectorAll('td');

    //   // TIDO

    //   const index = this.results.findIndex(({ ident }) => ident === runway.innerHTML);

    //   this.results[index] = { ...this.results[index], slope };
    // });

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
