
## European Third Party Inclusion Reporting

This project uses the European Data Protection Supervisor tool: website-evidence-collector

## Repository Map

* `site`: it contains the structure of a site in [HUGO](https://gohugo.io) and the content are automatically published in [gdpr.observer](https://gdpr.observer).
* `assets`: everything binary that might be used, reused, ans worthy of the shared. Presentation, articles, whatever
* `.gitignore`: it would let you understand why this repository has not code to crawl website
* `bin`: scripts to be executed

## How To

1. you need to have a valid list of URL, and perhaps with other additional metadata, in JSON or CSV format. **This list would be named Batch**. Normally this list is in `input/` folder.
2. you can run a command to analyze a Batch. Normally this is associated with a country (i.e. the spanish privacy activist might have a Batch with all the public institutions). A Batch is a string, such as, "institution-ES-1"
3. If you want to expand the list of tested websites, it is suggested to change your Batch string to reflect it, such as "institution-ES-2", because you might want to avoid the growth of tested website interfere with your statistics.
4. Every Batch can be re-tested everyday. Testing the same Batch more often is discouraged (and not even guarantee it work).

Now you're ready to lunch commands. These commands should be run after the [setup](#setup).

#### 1st: acquisition

```
bin/collect-with-wec.mjs --country XX --source input/portugal-partial.json
```

This command invokes also `bin/acquire.mjs` and `bin/id.mjs`, as well as `./website-evidence-collector/bin/website-evidence-collector.js`

#### 2nd: utilities

```
bin/produce-stats.mjs
```


#### 3rd: not yet completed

```
bin/infofetch.js
bin/airtable-fetcher.mjs
```


## Setup

The commands below assume your Linux system has a NodeJS version >= 16.x

```
npm install
git clone https://github.com/EU-EDPS/website-evidence-collector.git 
cd website-evidence-collector
npm install
cd ..
npm test
```

The last command would tell you if the system is ready to run. remind you need mongodb running in the server.

### Special: do you want to try WebEvidenceCollector?

```
cd website-evidence-collector
bin/website-evidence-collector.js https://eportugal.gov.pt
```

## Small sample

An example on which data is gather is in the [MONGODB](https://github.com/vecna/ETPIR/blob/main/MONGODB.md) file, it has been produced by running

```
npm install
bin/collect-with-wec.mjs
mongosh -d etpir-default -c beacons -q 'db.beacons.find({}).limit(1)'
```

Where `etpir-default` is the default database name, `beacons` is one of the collection generated based on the Web Evidence Collector output.

---

### Contacts

* This project is coordinated by [Claudio Agosti](https://twitter.com/@_vecna), for the [Hermes Center](https://hermescenter.org).  Mail at `<projects at hermescenter dot org>`.
* A new discussion place for communities and organized should be defined.


### License

* AGPL-3

