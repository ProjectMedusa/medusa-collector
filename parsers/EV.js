/* eslint-disable no-restricted-globals */
/* eslint-disable radix */
const { Parser } = require('../../medusa-collector-utils');

class EV extends Parser {
  extractPorNot(element) {
    if (/p/.test(element?.innerHTML)) {
      return element.querySelector('p')?.innerHTML;
    }
    return element?.innerHTML;
  }

  parseIntersection(string) {
    return string.match(/Take-off from intersection with TWY ([A-Z0-9\s]+)/)[1];
  }

  parseRunway([runway, rawTora, rawToda, rawAsda, rawLda, remarks]) {
    // like honestly why tf do they do this
    if (!(/See also/).test(runway.innerHTML)) {
      const index = this.results.findIndex(({ ident }) => ident === runway.innerHTML);

      const dataObj = {
        tora: parseInt(this.extractPorNot(rawTora)),
        toda: parseInt(this.extractPorNot(rawToda)),
        asda: parseInt(this.extractPorNot(rawAsda)),
      };

      if (index > -1) {
        // this is an intersection
        const ident = this.parseIntersection(this.extractPorNot(remarks));
        this.results[index].intx.push({
          ident,
          ...dataObj,
        });
      } else {
        // this is a runway
        this.results.push({
          ident: this.extractPorNot(runway),
          ...dataObj,
          lda: parseInt(this.extractPorNot(rawLda)),
          intx: [],
          slope: null,
        });
      }
    }
  }

  runwayRows(rows) {
    rows.forEach((row) => {
      const runwayRows = row.querySelectorAll('td');
      this.parseRunway(runwayRows);
    });
  }

  parseSlopes(slopes) {
    return slopes
      .replace(/%/g, '')
      .replace(/ /, '')
      .split('/')
      .map((item) => parseFloat(item));
  }

  parseDistances(distances) {
    return distances
      .replace(/m/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .split('/')
      .map((item) => parseInt(item));
  }

  runwayCharacteristics(rows) {
    rows.forEach((row) => {
      const [runway, rawSlope] = row.querySelectorAll('td');

      const index = this.results.findIndex(({ ident }) => ident === runway.innerHTML);

      // todo
      if (rawSlope !== undefined) {
        // a check to make sure that slope info exists
        if (rawSlope.innerHTML !== 'NIL' && !rawSlope.innerHTML.startsWith('NIL') && /%/.test(rawSlope.innerHTML)) {
          // check to determine whether we should compute weighted averages
          if (/up|down/i.test(rawSlope.innerHTML)) {
            const [, unparsedSlope, dir] = rawSlope.innerHTML.match(/([0-9.]+)% (up|down)/);

            let slope = unparsedSlope;
            if (dir === 'down') {
              slope = `-${unparsedSlope}`;
            }

            this.results[index].slope = parseFloat(slope);
          } else {
            // console.log(rawSlope.innerHTML !== 'NIL' || !(rawSlope.innerHTML.startsWith('NIL')));

            const [, rawSlopes, rawDistances] = rawSlope.innerHTML
              .match(/([-+0-9.%/\sNIL]+)(?:<br.*>)?(\(.*\))/);

            const slopes = this.parseSlopes(rawSlopes);
            const distances = this.parseDistances(rawDistances);

            const totalDistance = distances.reduce((acc, dist, i) => {
              if (!isNaN(slopes[i])) {
                return acc + dist;
              }
              return acc;
            }, 0);

            const weightedAverage = slopes.reduce((acc, slope, i) => {
              // check if its not nil
              if (!isNaN(slope)) {
                return (slope * distances[i]) + acc;
              }
              return acc;
            }, 0) / totalDistance;

            this.results[index].slope = Math.round((weightedAverage + Number.EPSILON) * 100) / 100;
          }
        }
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

module.exports = {
  ParserImplementation: EV,
  parseAerodromeString,
};
