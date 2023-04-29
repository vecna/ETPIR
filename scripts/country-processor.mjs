#!/usr/bin/env node
/* eslint-disable camelcase */
import _ from 'lodash';
import { argv, fs, $, path } from 'zx';
import dns from 'dns';
import geoip from 'fast-geoip';

import logger from 'debug';
const debug = logger('country-processor:domain');
const debugio = logger('country-processor:io');

import { fetch as fogp } from 'fetch-opengraph';

if (!argv.source) {
  console.log("Missing --source, normally a .txt of URLs from rawlists/");
  process.exit(1);
}

if (!argv.name) {
  console.log("Missing --name (necessary later, would be in input/$name.yaml, and be the 'name' in the mongodb)");
  process.exit(1);
}
const campaignName = argv.name.trim();
const latestSymlink = path.join('output', 'metai', `${campaignName}-latest`);

const list = await fs.readFile(argv.source, 'utf-8');

/* here parallelization starts */
if (!argv.sessions) {
  console.log("--session 35 by default is assumed!");
}
const sessions = argv?.sessions || 35;

const seconds = _.parseInt(argv?.seconds) || 0.1;
const entries = list.split('\n');
const chunksN = _.round(entries.length / sessions);
debugio(`Dividing ${entries.length} in ${chunksN} because of ${sessions} parallel sessions. new on ${seconds} seconds`);
const chunks = _.chunk(entries, chunksN);
let sessionActive = 0;

setInterval(async () => {

  if(chunks.length) {
    const batch = chunks.pop();
    sessionActive++;
    debugio(`[+] Session ${sessionActive}/${chunks.length} picked a batch of ${batch.length} sites, still to get ${chunks.length} chunks`);
    for (const site of batch) {
      debugio(`  ++ site ${site}`);
      const rv = await processLine(site);
    }
    debugio(`Session completed ${sessionActive} decrements`);
    sessionActive--;
  }

}, seconds * 1000);

setInterval(async () => {
  debugio("                     ", new Date());
  debugio("                     ", `${sessionActive}/${sessions}`, "sessions active");
  if(!sessionActive) {
    console.log(`Process completed`)
    process.exit(0);
  }
}, 10000)

async function processLine(site) {

  if(_.startsWith(site, '#')) {
    console.log(`Skipping commented line ${site}`);
    return null;
  }
  if(site.length < 2)
    return null;

  if(!_.startsWith(site, 'http'))
    site = `http://${site}`;

  let metaidir, hostname = null;
  try {
    const urlo = new URL(site);
    hostname = urlo.hostname;

    const day = new Date().toISOString().substring(0, 10);
    metaidir = path.join('output', 'metai', campaignName, day);

    if(!fs.existsSync(metaidir))
      await $`mkdir -p ${metaidir}`

    // create symlink to the latest campaign day
    const dest = path.join(campaignName, day);
    try {
      await fs.symlink(dest, latestSymlink);
    } catch(error) {
      if(error.code != "EEXIST") {
        console.log(`Symlink error: ${error.message}`);
        process.exit(1);
      }
    }
  } catch(error) {
    console.log(`${error.code} in ${site}: ${error.message}`);
    return null;
  }

  try {

    const ogf = path.join(metaidir, `${hostname}.json`);
    if(fs.existsSync(ogf)) {
      console.log(`File ${ogf} exists, skipping`);
      return null;
    }

    const ogpe = await fogp(site);
    if(JSON.stringify(ogpe).length < 3)
      throw new Error(`Not actually produced OGP data?`);

    // Call to reverse function along with lookup function.
    await dns.lookup(hostname,
      async function onLookup(err, address, family) {
        ogpe['ipv4'] = address;
        debug(`  IP resolved for ${hostname}: ${address}`)
        let location = null;

	      try {
	      	location = await geoip.lookup(address);
	      }
	      catch(error) {
                 console.log(`Error: ${error.message} in ${site}`);
	      }

        if(location && location.country) {
          ogpe.country = location.country;
          ogpe.region = location.region;
          ogpe.city = location.city;
          ogpe.timezone = location.timezone;
        }
        await dns.reverse(address, async function (err, hostnames) {

          if(hostnames && hostnames.length)
            ogpe['reverses'] = hostnames.join(',');

          await fs.ensureDir(metaidir);
          await fs.writeFile(ogf, JSON.stringify(ogpe, undefined, 2), 'utf-8');
          debug(`  Produced ${JSON.stringify(ogpe).length} OGP bytes (${site}) in ${JSON.stringify(_.pick(ogpe, ['country', 'region', 'city', 'timezone']))}`);
        });  
      }
    );

  } catch(error) {
    console.log(`${error.message} in ${site}`);
  }
}

console.log(`Resolves complete, results in ${latestSymlink} now please use scripts/importer.mjs`);
