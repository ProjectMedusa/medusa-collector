/* eslint-disable class-methods-use-this */
const { Parser } = require('@project-medusa/collector-utils');

class EY extends Parser {
  intersection(string) {
    const match = string.match(/From TWY (.*)/);
    return /,/.test(match[1]) ? match[1].split(', ') : match[1];
  }

  runwayRows(rows) {
    let currentRunway;
    const findIndex = (rwy) => rwy.ident === currentRunway;

    rows.forEach((row) => {
      const runwayRows = row.querySelectorAll('td');
      if (/\d{2}/.test(runwayRows[0].innerHTML)) {
        currentRunway = runwayRows[0].innerHTML;
        const [tora, toda, asda, lda] = runwayRows;

        this.results.push({
          ident: currentRunway,
          tora: tora.innerHTML,
          toda: toda.innerHTML,
          asda: asda.innerHTML,
          lda: lda.innerHTML,
          intersections: [],
        });
      } else {
        const [intx, tora, toda, asda] = runwayRows;
        this.results[
          this.results.findIndex(findIndex)
        ].intersections.push({
          intx: this.intersection(intx.innerHTML),
          tora: tora.innerHTML,
          toda: toda.innerHTML,
          asda: asda.innerHTML,
        });
      }
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

module.exports = { ParserImplementation: EY, parseAerodromeString };
