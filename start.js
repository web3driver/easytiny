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

function run(resize, overwrite) {
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

    if (!overwrite && !hasCompress) fs.mkdir(path.join(cwdpath, 'compress'));

    if (resize) {
        setResizeParam()
            .then(function (v) {
                doCompress(imageList, overwrite, v);
            });
    } else {
        doCompress(imageList, overwrite);
    }
}

function doCompress(imageList, overwrite, resizeObj) {
    let promise = [];
    let _path = '';
    imageList.forEach(function (v) {
        let _name = v;
        try {
            let _promise;
            if (!util.is.empty(resizeObj)) {
                _promise = tinify.fromFile(v).resize(resizeObj);
            } else {
                _promise = tinify.fromFile(v);
            }
            if (overwrite) {
                _path = path.join(cwdpath, path.basename(v));
            } else {
                _path = path.join(cwdpath, 'compress', path.basename(v));
            }
            _promise.toFile(_path)
                .then(function () {
                    console.log(util.chalk.green(`${path.basename(v)} compressed successful!`));
                })
                .catch(function (err) {
                    throw err;
                });
            promise.push(_promise);
        } catch (error) {
            throw error;
        }
    });

    if (util.is.empty(promise)) {
        console.log();
        console.log(util.chalk.bgGreen(`No tasks to do!`))
    } else {
        Promise.all(promise).then(function (v) {
            console.log();
            console.log(util.chalk.bgGreen(`Image compressing tasks all done! You have compressed ${tinify.compressionCount} images this month!`))
        }).catch(function (err) {
            throw err;
        });
    }
}

function setResizeParam() {
    let inquirer = util.inquirer.createPromptModule();
    let resize = {};

    return inquirer([{
            type: 'list',
            name: 'method',
            message: 'Choose your resize method, use `npm start --help` to see the discription of three methods.',
            choices: ['scale', 'fit', 'cover']
        }])
        .then(function (answers) {
            Object.assign(resize, answers);
            if (answers.method === 'fit' || answers.method === 'cover') {
                return inquirer([{
                        type: 'input',
                        name: 'width',
                        message: 'Enter your target width,required!',
                        validate: function (input) {
                            if (util.is.empty(input)) {
                                return 'You need to provide the width';
                            }
                            if (!new RegExp('^[0-9]+$').test(input)) {
                                return 'You need to provide a number';
                            }
                            return true;
                        },
                        filter: function (value) {
                            return Number(value);
                        }
                    },
                    {
                        type: 'input',
                        name: 'height',
                        message: 'Enter your target height,required!',
                        validate: function (input) {
                            if (util.is.empty(input)) {
                                return 'You need to provide the height';
                            }
                            if (!new RegExp('^[0-9]+$').test(input)) {
                                return 'You need to provide a number';
                            }
                            return true;
                        },
                        filter: function (value) {
                            return Number(value);
                        }
                    }
                ]).then(function (answers) {
                    Object.assign(resize, answers);
                });
            }
            if (answers.method === 'scale') {
                return inquirer([{
                        type: 'input',
                        name: 'width',
                        message: 'Enter your target width. You must provide either a target width or a target height, but not both.',
                        filter: function (value) {
                            return Number(value);
                        }
                    },
                    {
                        type: 'input',
                        name: 'height',
                        message: 'Enter your target height. You must provide either a target width or a target height, but not both.',
                        filter: function (value) {
                            return Number(value);
                        }
                    }
                ]).then(function (answers) {
                    Object.assign(resize, answers);
                });
            }
        }).then(function () {
            return resize;
        })
}

module.exports = {
    run
}