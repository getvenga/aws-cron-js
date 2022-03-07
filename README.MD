# AWS Rule CRON Adjuster

A Script for iterating through AWS event bridge rules and adjusting the
hour portion of CRON expressions by a given value.

## Before you Run
Make sure you test your changes by running them in 'dryRun' mode first. dryRun
can be toggled on in main.js
`await adjustRuleCronHours(response.Rules, 1);`

`dryRun` is an optional argument to this function and is on by default. To switch it 
off, pass the flag as false:
`await adjustRuleCronHours(response.Rules, 1, false);`

PLEASE BY AWARE THAT BY DOING THIS YOU WILL BE MODIFYING AWS EVENT BRIDGE RULES


## How to Run
````
yarn install
node main.js
````
