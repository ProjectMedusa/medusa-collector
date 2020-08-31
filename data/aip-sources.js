const session = process.env.EUROCONTROL_SESSION;

module.exports = {
  session,
  sources: [
    {
      link:
        `https://www.ead.eurocontrol.int/eadbasic/eais-${session}/3QDXTD5E6YWTY/EN/2020-06-18-AIRAC-EN/html/index-en-GB.html?target=eAIP/EG-AD-2.$icao-en-GB.html`,
      country: 'EG',
      menuLink:
        `https://www.ead.eurocontrol.int/eadbasic/eais-${session}/3QDXTD5E6YWTY/EN/2020-06-18-AIRAC-EN/html/eAIP/EG-menu-en-GB.html`,
    },
    {
      link:
        `https://www.ead.eurocontrol.int/eadbasic/eais-${session}/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/index.html?show=eAIP/EY-AD-2.$icao-en-GB.html`,
      country: 'EY',
      menuLink:
        `https://www.ead.eurocontrol.int/eadbasic/eais-${session}/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/eAIP/EY-menu-en-GB.html#`,
      runwayCharacteristicsTable: 1,
    },
    {
      link: 'http://eaip.eans.ee/2020-08-13/html/eAIP/EE-AD-2.$icao-en-GB.html',
      country: 'EE',
      menuLink: 'http://eaip.eans.ee/2020-08-13/html/eAIP/EE-menu-en-GB.html',
      intersectionTableTitle: 'REDUCED DECLARED DISTANCES FOR TAKE OFF',
      runwayCharacteristicsTable: 1,
    },
    {
      link: 'https://ais.lgs.lv/eAIPfiles/2020_004_16-JUL-2020/data/2020-07-16-AIRAC/html/eAIP/EV-AD-2.$icao-en-GB.html',
      country: 'EV',
      menuLink: 'https://ais.lgs.lv/eAIPfiles/2020_004_16-JUL-2020/data/2020-07-16-AIRAC/html/eAIP/EV-menu-en-GB.html',
      runwayCharacteristicsTable: 1,
    },
  ],
};
