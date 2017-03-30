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

function isEmpty(value) {
    var type = toStr.call(value);
    var key;

    if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
        return value.length === 0;
    }

    if (type === '[object Object]') {
        for (key in value) {
            if (owns.call(value, key)) {
                return false;
            }
        }
        return true;
    }

    return !value;
}

module.exports = {
    chalk,
    confirm,
    is
};