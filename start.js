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

function run(resize, overwrite, force) {
    if (!getConfig()) process.exit(1);
    let imageList = [];

    fs.readdirSync(cwdpath).forEach(function (v) {
        let _ext = path.extname(v);
        if (_ext === '.jpg' || _ext === '.png') {
            imageList.push(v)
        }
    });

    if (resize) {
        confirmMode(resize, overwrite, force)
            .then(function (answers) {
                if (answers.ok) {
                    setResizeParam()
                        .then(function (v) {
                            doCompress(imageList, overwrite, v);
                        });
                } else {
                    process.exit(1);
                }
            })
            .catch(function (err) {
                throw err;
            })
    } else {
        confirmMode(resize, overwrite, force)
            .then(function (answers) {
                if (answers.ok) {
                    doCompress(imageList, overwrite);
                } else {
                    process.exit(1);
                }
            })
            .catch(function (err) {
                throw err;
            });
    }
}

function confirmMode(resize, overwrite, force) {
    if (force) return Promise.resolve({
        "ok": true
    });
    let msg_resize = resize ? ' resize' : '';
    let msg_overwrite = overwrite ? ' overwrite' : '';
    let msg_default = !resize && !overwrite ? ' default' : '';
    let connector = resize && overwrite ? ' and' : '';
    let description_resize = resize ? ' Images will be resized.' : '';
    let description_overwrite = overwrite ? ' Original images will be overwritten directely.' :
        ' Compressed images will be output into a new \'easytiny\' folder with a timestamp.';
    let msg = `Easytiny will be running under${msg_default}${msg_resize}${connector}${msg_overwrite} mode.${description_resize}${description_overwrite} Confirm and Continue!`
    return util.confirm(msg);
}

function doCompress(imageList, overwrite, resizeObj) {
    let promise = [];
    let _path = '';
    let _folderName = 'easytiny' + util.getTimeStamp();
    let _folderMsg = '';

    if (!overwrite && !!imageList.length) {
        _folderMsg = ` Check your compressed images at \'${path.join(cwdpath, _folderName)}\'.`
        fs.mkdirSync(path.join(cwdpath, _folderName));
    }

    imageList.forEach(function (v) {
        let _name = v;
        try {
            let _promise, _resize;
            if (!util.is.empty(resizeObj)) {
                _promise = tinify.fromFile(v).resize(resizeObj);
            } else {
                _promise = tinify.fromFile(v);
            }
            if (overwrite) {
                _path = path.join(cwdpath, path.basename(v));
            } else {
                _path = path.join(cwdpath, _folderName, path.basename(v));
            }
            _resize = _promise.toFile(_path)
                .then(function () {
                    console.log(util.chalk.green(`${path.basename(v)} compressed successful!`));
                })
                .catch(function (err) {
                    throw err;
                });
            promise.push(_resize);
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
            console.log(util.chalk.bgGreen(`Image compressing tasks all done!${_folderMsg}`));
            console.log(util.chalk.bgGreen(`You have compressed ${tinify.compressionCount} images this month!`));
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