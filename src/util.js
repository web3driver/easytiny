"use strict";

const inquirer = require('inquirer');
const chalk = require('chalk');
const is = require('is');

function confirm(msg) {
    return inquirer.prompt([{
        type: 'confirm',
        message: msg,
        name: 'ok'
    }]);
}

function getTimeStamp() {
    let _now = new Date();
    let year = _now.getFullYear();
    let month = (_now.getMonth() + 1) < 10 ? '0' + (_now.getMonth() + 1) : _now.getMonth() + 1;
    let day = _now.getDate() < 10 ? '0' + _now.getDate() : _now.getDate();
    let hour = _now.getHours() < 10 ? '0' + _now.getHours() : _now.getHours();
    let minute = _now.getMinutes() < 10 ? '0' + _now.getMinutes() : _now.getMinutes();
    let seconds = _now.getSeconds() < 10 ? '0' + _now.getSeconds() : _now.getSeconds();
    let ms = _now.getMilliseconds() < 10 ? '00' + _now.getMilliseconds() :
        _now.getMilliseconds() < 100 ? '0' + _now.getMilliseconds() : _now.getMilliseconds();
    return [year, month, day, hour, minute, seconds, ms].join('');
}

module.exports = {
    chalk,
    confirm,
    is,
    inquirer,
    getTimeStamp
};