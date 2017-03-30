"use strict";

const inquirer = require('inquirer');
const chalk = require('chalk');
const is = require('is');

function confirm(msg, cb) {
    inquirer.prompt([{
        type: 'confirm',
        message: msg,
        name: 'ok'
    }]).then(cb)
}

module.exports = {
    chalk,
    confirm,
    is,
    inquirer
};