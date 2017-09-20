"use strict";

const fs = require('fs');
const path = require('path');
const process = require('process');
const tinify = require('tinify');
const config = require('./config');
const util = require('./util');
const log = require('./log');
const cwdpath = process.cwd();


/**
 * 校验是否存在本地配置
 */
function _checkConfig() {
    let params = config.readParam();
    if (util.is.empty(params)) {
        log.fail(`read configuration failed, 'easytiny config list' to check your config`);
        return false;
    }
    if (util.is.empty(params.key)) {
        log.fail(`tinypng api key not set, 'easytiny config --help' to see how to set api key`);
        return false;
    }
    _setConfig(params.key, params.proxy);
    return true;
}

/**
 * 给tinypng api设置key值和proxy值
 * @param {string} key 
 * @param {string} proxy 
 */
function _setConfig(key, proxy) {
    if (!util.is.empty(key)) tinify.key = key;
    if (!util.is.empty(proxy)) tinify.proxy = params.proxy;
}

/**
 * 获取路径下的图片列表
 * @param {string} imgDir 需要读取图片列表的文件绝对路径
 * @param {string} relativeDir 文件的相对路径
 * @return {array} 图片列表
 */
function _getImageList(imgDir, relativeDir = "") {
    let imgList = [];
    fs.readdirSync(imgDir).forEach(function (v) {
        let stat = fs.statSync(path.join(imgDir, v));
        if (stat.isDirectory()) {
            let obj = {};
            Object.defineProperty(obj, v, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: _getImageList(path.join(imgDir, v), path.join(relativeDir, v))
            })
            imgList.push(obj);
        }
        if (stat.isFile()) {
            let _ext = path.extname(v);
            if (_ext === '.jpg' || _ext === '.png') {
                imgList.push(path.join(relativeDir, v))
            }
        }
    });
    return imgList;
}

/**
 * easytiny 主程序
 * @param {*} resize 
 * @param {*} overwrite 
 * @param {*} force 
 */
function run(resize, overwrite, force) {
    if (!_checkConfig()) process.exit(1);

    let imageList = _getImageList(cwdpath);

    confirmMode(resize, overwrite, force)
        .then(function (answers) {
            if (answers.ok) {
                if (resize) {
                    setResizeParam()
                        .then(function (v) {
                            doCompress(imageList, overwrite, v);
                        });
                }
                else {
                    doCompress(imageList, overwrite);
                }
            } else {
                process.exit(1);
            }
        })
        .catch(function (err) {
            throw err;
        })
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
    let _basePath = overwrite ? cwdpath : path.join(cwdpath, _folderName);

    if (!overwrite && !!imageList.length) {
        _folderMsg = ` Check your compressed images at \'${path.join(cwdpath, _folderName)}\'.`
        fs.mkdirSync(path.join(cwdpath, _folderName));
    }
    _tinyImage(imageList, overwrite, resizeObj, _folderMsg, _folderName);

    function _tinyImage(imageList, overwrite, resizeObj, _folderMsg, _folderName) {
        for (let i = 0; i < imageList.length; i++) {
            let _promise, _resize;
            let v = imageList[i];
            // 如果检测到是目录就执行递归逻辑
            if (Object.prototype.toString.call(v) === "[object Object]") {
                Object.keys(v).forEach(function (key) {
                    _tinyImage(v[key], overwrite, resizeObj, _folderMsg, _folderName);
                });
                continue;
            }
            try {
                _promise = util.is.empty(resizeObj) ? tinify.fromFile(v) : tinify.fromFile(v).resize(resizeObj);
                _path = path.join(_basePath, v);
                if(!fs.existsSync(path.join(_basePath, path.dirname(v)))){
                    fs.mkdirSync(path.join(_basePath, path.dirname(v)));
                }
                _resize = _promise.toFile(_path)
                    .then(function () {
                        log.info(`${v} compressed successful!`);
                    })
                    .catch(function (err) {
                        throw err;
                    });
                promise.push(_resize);
            } catch (error) {
                throw error;
            }
        }
        if (util.is.empty(promise)) {
            log.error(`No tasks to do!`);
        } else {
            Promise.all(promise).then(function (v) {
                log.success(`Image compressing tasks all done!${_folderMsg}`, `You have compressed ${tinify.compressionCount} images this month!`);
            }).catch(function (err) {
                throw err;
            });
        }
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