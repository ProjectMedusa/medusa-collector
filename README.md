# [![Generic badge](http://project-medusa.herokuapp.com/gh-badge)](http://project-medusa.herokuapp.com/coverage) medusa-collector

This package is used to collect runway, intersection, and obstacle (Soon™) data from eAIPs.

## Public API

Coverage: click the badge bext to the repo's title at the top of the readme.
**Note: clicking on the markers will give you a direct link to the endpoint**

http://project-medusa.herokuapp.com/api/airports/ICAO

## Concept :question:

* The `parsers` folder:
  * Each country has its own parser
  * Each country's parser is named after it's 2-letter area code
  * Each parser extends the `Parser` class from [medusa-collector-utils](https://github.com/ProjectMedusa/medusa-collector-utils)
  * Each parser exports an object containing:
    * `ParserImplementation`: this is the extended `Parser` class, and should also be named like its file name
    * `parseAerodromeString`: this is a function, that is responsible for parsing out the airport icao out of a specific string. See [medusa-collector-utils](https://github.com/ProjectMedusa/medusa-collector-utils)

```js
{
  ParserImplementation: CLASS,
  parseAerodromeString: function(string) {...}
}
```

* The `cache/` folder:
  * The contents of this folder are *.gitignored*
  * This folder contains cached aerodrome coverage
  * Each country has its own `JSON` file with the array of covered aerodromes
  * Each entry is named by the following format: `XX_airports.json`, where *XX* stands for the 2-letter area code

* The `results/` folder:
  * The contents of this folder are *.gitignored*
  * This folder contains `JSON` files for each airport
  * Each entry is named `XXXX.json`, where *XXXX* stands for a 4-letter *ICAO* code
  * ***Each JSON file must follow the strict following structure:***

Please see the included `results/EYKA.json` file

```json
[
	{
		"ident": string,
		"tora": integer,
		"toda": integer,
		"asda": integer,
		"lda": integer,
		"intx": [
			{
				"ident": array|string,
				"tora": integer,
				"toda": integer,
				"asda": integer
			}
    ],
    slope: null|float|integer,
	},
	{
		"ident": string,
		"tora": integer,
		"toda": integer,
		"asda": integer,
		"lda": integer,
		"intx": [
			{
				"ident": array|string,
				"tora": integer,
				"toda": integer,
				"asda": integer
			}
    ],
    slope: null|float|integer,
  }
  (...)
]
```

* The `.env` file:
  * This file is *.gitignored*
  * This file contains your:
    * `EUROCONTROL_SESSION`: A session *ID* that can be used to access published eAIPs
    * `AOI`: **A**rea **O**f **I**intersest. The 2-letter area code
* The `data/aip-sources.js` file:
  * This file contains all *eAIP* sources

## Contributing :muscle:

### Table of Contents

- [![Generic badge](https://shields.io/)](#img-srchttpsimgshieldsiobadge3csubject3e-3cstatus3e-3ccolor3esvg-altgeneric-badge)
  - [Public API](#public-api)
  - [Concept :question:](#concept-question)
  - [Contributing :muscle:](#contributing-muscle)
    - [Table of Contents](#table-of-contents)
    - [**Setting Up**](#setting-up)
      - [Setting the `AOI`](#setting-the-aoi)
      - [Setting the `EUROCONTROL_SESSION`](#setting-the-eurocontrol_session)
    - [**Setting up your sources**](#setting-up-your-sources)
      - [Contents](#contents)
      - [Creating a new entry](#creating-a-new-entry)
    - [Writing a `Parser`](#writing-a-parser)
      - [Creating a parser file and a class](#creating-a-parser-file-and-a-class)
      - [Writing parser methods](#writing-parser-methods)
    - [Running the damn thing!](#running-the-damn-thing)
    - [A note about contributions](#a-note-about-contributions)

-------

### **Setting Up**

* First thing you need to do is fork the repository and clone it to your machine.

* Then copy the `.env.example` to `.env`

```bash
cp .env.example .env
```

#### Setting the `AOI`

Inside the `.env` file, set the `AOI` value to the area you're interested in working on. In this example we'll use `EY`.

#### Setting the `EUROCONTROL_SESSION`

**Note: You only need to set this if your source is from eurocontrol, if not feel free to skip this step**

To obtain this value, login to [Eurocontrol](https://www.ead.eurocontrol.int/cms-eadbasic/opencms/en/login/), find a random *eAIP* link.  
Here's mine: [eadbasic/eais-31275888902FF0E51BECC6250B398377/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/index.html?show=eAIP/EY-AD-2.EYKA-en-GB.html](#)

Your session ID is the string after `eais-`.  
Here's mine again: `31275888902FF0E51BECC6250B398377`.

Set `EUROCONTROL_SESSION` value to your session ID.

Note that sessions last for **30 mintues**.

Here's how your `.env` file should look:

```env
EUROCONTROL_SESSION=31275888902FF0E51BECC6250B398377
AOI=EY
```

### **Setting up your sources**

#### Contents

* Open the `data/aip-sources.js` file
* Each entry of the `sources` array contains the following key-value pairs:
  * `country`: 2-letter area code; **AOI**
  * `menuLink`: this is a direct link to the *eAIPs* menu. This is usually found as an `iframe`
  * `link`: this is a *template* link to the *eAIP*.
  * And it might have a `runwayCharacteristicsTable`: This tells the utils package which table contains the stuff that our parser wants (the characteristics table). This is an index. Default value is 0
  * It also may have a `intersectionTable` **OR** a `intersectionTableTitle`: This tells the utils package, which table contains the intersections. The former is meant to tell the index, when the table does not have its own `.Title`. The latter is meant to declare the title of the intersection table.

-------

#### Creating a new entry

To create a new source, simply append an object to the `sources` array.

***Note: make sure to include the full URL in your values***

* Finding out the `runwayCharacteristicsTable`:
  * Scroll down at your airport's *eAIP*, until you see the `RUNWAY PHYSICAL CHARACTERISTICS` table. Usually this section contains 2 HTML tables.
  * If the slope column is in the first one, then you don't need to write this value out at all, if it's not, then you need to declare this parameter.

* Finding the `link`:
  * Go to your *eAIP*, on the left sidebar find a header containing `AERODROMES`. Click on it to expand the list of covered aerodromes.
  * Right-click any aerodrome and `Copy link address`.
  * To turn this into a *template* link go ahead and replace any references to the icao code with `$icao`.
  * And replace the session *ID* with `${session}`
    * eadbasic/eais-31275888902FF0E51BECC6250B398377/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/eAIP/EY-AD-2.EYKA-en-GB.html#AD-2.EYKA `->` \`eadbasic/eais-\${session}/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/eAIP/EY-AD-2.***$icao***-en-GB.html\`
  * Now paste this link inside the object as a `template literal` (under `link`)
* Finding the `menuLink`:
  * This is usually an `iframe`
  * Find it via the dev-tools and copy the `src`
    * eadbasic/eais-31275888902FF0E51BECC6250B398377/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/eAIP/EY-menu-en-GB.html `->`
    * eadbasic/eais-\${session}/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/eAIP/EY-menu-en-GB.html
  *  Now paste this link inside the object as a `template literal` (under `menuLink`)

* After doing all the steps above, you should end up with an object looking like this:

```js
{
      link: `https://www.ead.eurocontrol.int/eadbasic/eais-${session}/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/index.html?show=eAIP/EY-AD-2.$icao-en-GB.html`,
      country: 'EY',
      menuLink: `https://www.ead.eurocontrol.int/eadbasic/eais-${session}/XRW43IAS45SGI/EN/2020-06-18-AIRAC/html/eAIP/EY-menu-en-GB.html#`,
},
```

### Writing a `Parser`

* [Creating a parser file and a class](#creating-a-parser-file-and-a-class)
* [Writing parser methods](#writing-parser-methods)

-------

#### Creating a parser file and a class

Each country has their own parser, because each country for some stupid reason structures their data differently.

Mainly, a `Parser` class is responsible for parsing `HTML Table` rows.

To create a new `Parser`, add a file under `parsers/` named after your country's 2-letter area code.

Then, import the `Parser` class from [medusa-collector-utils#parser](https://github.com/ProjectMedusa/medusa-collector-utils#parser)

Create a new class named after your country's 2-letter area code. Make sure to extend the default `Parser` class with it.

Write a function called `parseAerodromeString`.

`module.export` your class as `ParserImplemenation` and your function.

Your parser file should now look like this:

```js
const { Parser } = require('@project-medusa/collector-utils');

class EY extends Parser {}

function parseAerodromeString() {}

module.exports = {
  ParserImplemenation: EY,
  parseAerodromeString
}

```

-------

#### Writing parser methods

Your class ***must*** override a method called `runwayRows(rows)`.

The `runwayRows` method is where most of the bussiness logic of your parser happens. It gets fed by an `HTML` "row" that the function needs to parse.

`runwayRows` should not return anything.
`runwayRows` should push the results to an array called `this.results`

`runwayCharasteristics`; this method is responsible for extracting runway slope data. The concept of this method is the same as `runwayRows`

`intxRows`; this method is responsible for extracting the intersections, **IF** it's under a different table than the usual `DECLARED DISTANCES`.

After all of the pushing has stopped (lol) go ahead and call `this.save()`. This saves the runway/intersection data.

***Note: for examples, please see `parsers/*.js`***

-------

The `parseAerodromeString` method is what gets called to parse out an icao.  
Usually this same function works pretty well for most countries, but there are some differences.

The string that it takes is usually an `id` attribute off of an `HTML` element. To find it, go to your `menuLink` and hover over an aerodrome icao/name. Then grab the `id` of said element.

Here's mine: `AD-2.EYKA`, `AD-2.EYKA1203548679687`, `EYKA1203548679687details`.

Now write a function inside `parseAerodromeString` that only returns the icao code.

Take a look at `parsers/*.js` again to see how it works.

-------

### Running the damn thing!

To start it, simply run

```bash
node .
```

### A note about contributions

To make a contribution, open a PR, and **make sure to follow** the included eslint rules when writing your parser.

If you ever found yourself limited by the functionality [medusa-collector-utils](https://github.com/ProjectMedusa/medusa-collector-utils) gives you are always welcome to override methods from it or open a few issues.

Good luck:exclamation:
