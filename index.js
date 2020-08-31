/* eslint-disable no-console */
require('dotenv').config();

const medusaUtils = require('@project-medusa/collector-utils');

const { ParserImplementation, parseAerodromeString } = require(`./parsers/${process.env.AOI}`);

const { createPage, getPage: page } = medusaUtils.Page;
const { AirportCollector, Collector } = medusaUtils;

const aipSources = require('./data/aip-sources.js').sources;

const currentSource = aipSources.find((source) => source.country === process.env.AOI);

(async () => {
  await createPage({ headless: false, slowMo: 0, args: ['--user-agent=New User Agent', '--single-process'] });
  await page().goto(currentSource.menuLink);

  // Instantiate an AirportCollector Instance
  const airportCollector = new AirportCollector(process.env.AOI, parseAerodromeString);

  // Find all covered airports by AOI's eAIP
  const airports = await airportCollector.findCoveredAirports();

  // For each airport instantiate a Collector Instance

  console.log(`${airports.length} airports in total`);
  let i = 0;
  for (const airport of airports) {
    if (!require('fs').existsSync(`results/${airport}.json`)) {
      console.log(`[${i}] [${airport}] Proccessing..`);
      const parser = new ParserImplementation(
        airport,
        currentSource.link,
        currentSource.runwayCharacteristicsTable,
        currentSource.intersectionTableTitle,
        currentSource.intersectionTable,
      );
      const collector = new Collector(parser);
      await collector.retriveAndParseTable();
    } else {
      console.log(`[${i}] [${airport}] Already exists, skipping..`);
    }
    i += 1;
  }
})();
