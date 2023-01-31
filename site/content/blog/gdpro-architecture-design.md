---
title: "gdpr.observer architecture design"
date: 2023-01-18
draft: false
featured: true
description: "A design of our pipeline, with existing and future components"
---

GDPRo is a pipeline, a sequence of components that need to be executed in sequence.

Is implemented under an AGPL-v3 license, and you can review or fork the code from this [github repository](https://github.com/vecna/gdpr.observer).


It is implemented to run via `nodejs` and depends from these fundamental frameworks:
* Web Evidence Collector, from the EDPS, based on Puppeteer.
* _Consent-o-matic_ (not really, the [Extension](https://github.com/cavi-au/Consent-O-Matic) is not working with the various cookie banner we're spotting on institution. Finding way to contribute to the package is part of our mandate, so we're keeping it into the design)
* Javascript frameworks: `expressJS`, `zx`, `lodash`.

![architecture-design-1](/images/design/architecture-1.jpg)

<!-- https://miro.com/app/board/uXjVPvt9YPs=/ -->

## Vocabulary

* **Batch of website**: it is a list of website (normally, institutions from an EU member state) that need to be analyzed.

## Getting started

TODO 

## Workflow

TODO 

## APIs

TODO 

## Data Model

TODO 

