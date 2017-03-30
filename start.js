"use strict";

const fs = require('fs');
const path = require('path');
const process = require('process');
const tinify = require('tinify');
const config = require('./config');
const util = require('./util');
const cwdpath = process.cwd();


function getConfig() {
    let params = config.readParam();
    if (util.is.empty(params)) {
        console.log();
        console.log(util.chalk.bgRed(`    read configuration failed, 'easytiny config list' to check the reason`));
        return false;
    }
    if (util.is.empty(params.key)) {
        console.log();
        console.log(util.chalk.bgRed(`    tinypng api key not set, 'easytiny config --help' to see how to set api key`));
        return false;
    } else {
        tinify.key = params.key;
    }
    if (!util.is.empty(params.proxy)) {
        tinify.proxy = params.proxy;
    }
    return true;
}

function run() {
    if (!getConfig()) process.exit(1);
    let imageList = [];
    let hasCompress = false;
    fs.readdirSync(cwdpath).forEach(function (v) {
        if (v === 'compress') hasCompress = true;
        let _ext = path.extname(v);
        if (_ext === '.jpg' || _ext === '.png') {
            imageList.push(v)
        }
    });

    if (!hasCompress) fs.mkdir(path.join(cwdpath, 'compress'));

    let promise = [];

    imageList.forEach(function (v) {
        let _name = v;
        try {
            let _promise = tinify.fromFile(v)
                .toFile(path.join(cwdpath, 'compress', path.basename(v)))
                .then(function(){
                    console.log(util.chalk.green(`${path.basename(v)} compressed successful!`))
                });
            promise.push(_promise);
        } catch (error) {
            throw error
        }
    });

    Promise.all(promise).then(function(){
        console.log();
        console.log(util.chalk.bgGreen(`Image compressing tasks all done! You have compressed ${tinify.compressionCount} images this month!`))
    });
}

module.exports = {run}