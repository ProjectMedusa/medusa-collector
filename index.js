require('dotenv').config();

const medusaUtils = require('../medusa-collector-utils');

const { createPage, getPage: page } = medusaUtils.Page;
const { AirportCollector } = medusaUtils;

const aipSources = require('./data/aip-sources.js').sources;

const currentSource = aipSources.find((source) => source.country === process.env.AOI);

(async () => {
  await createPage({ headless: false, slowMo: 0, args: ['--user-agent=New User Agent'] });
  await page().goto(currentSource.menuLink);

  // Instantiate an AirportCollector Instance

  const airportCollector = new AirportCollector(process.env.AOI);

  // Find all covered airports by AOI's eAIP
  const airports = await airportCollector.findCoveredAirports();
})();
