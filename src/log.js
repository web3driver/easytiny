"use strict";

const util = require('./util');

function fail(...msgs) {
    console.log();
    msgs.forEach(function(msg){
        console.log(util.chalk.bgRed(`    ${msg}`));
    });
}

function success(...msgs) {
    console.log();
    msgs.forEach(function(msg){
        console.log(util.chalk.bgGreen(`    ${msg}`));
    });
}

function error(msg) {
    console.log(util.chalk.red(`    ${msg}`));
}

function warn(msg) {
    console.log();
    console.log(util.chalk.yellow(`    ${msg}`));
}

function info(msg) {
    console.log(util.chalk.green(`    ${msg}`));
}

module.exports = {
    fail: fail,
    success: success,
    error: error,
    warn: warn,
    info: info
}