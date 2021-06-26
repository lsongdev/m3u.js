#!/usr/bin/env node

const myapp = require('..');
const pkg   = require('../package');

const help = () => {
  console.log();
  console.log(` ${pkg.name}@${pkg.version}`);
  console.log();
  console.log(` - version`);
  console.log(` - help`);
};

const commands = {
  help,
  version() {
    console.log(pkg.version);
  }
};

const command = process.argv[2];
const parameters = process.argv.slice(3);
(commands[command] || commands.help).apply(myapp, parameters);