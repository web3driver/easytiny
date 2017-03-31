"use strict";

const process = require('process');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const rcfile = path.join(__dirname, '.easytinyrc');

function readParam() {
    let _params = {};
    let _config, _parseConfig;

    try {
        _config = fs.readFileSync(rcfile, 'utf8');
    } catch (error) {
        _config = '';
    }

    try {
        if (util.is.empty(_config)) {
            _parseConfig = {};
        } else {
            _parseConfig = JSON.parse(_config);
        }
    } catch (error) {
        console.error(util.chalk.bgRed(`check your ${path.normalize(__dirname)}/.easytinyrc`));
        process.exit(1);
    }
    Object.assign(_params, _parseConfig);
    return _params;
}

function listParam() {
    let _params = readParam();
    console.log()
    console.log(util.chalk.bgBlue('  Configurations:'))
    if (util.is.empty(_params)) {
        console.log()
        console.log(util.chalk.red('    no configurations found'))
        console.log()
        process.exit(1)
    } else {
        Object.keys(_params).forEach(function (key) {
            console.log(util.chalk.blue(`    ${key} = ${_params[key]}`))
        })
        console.log()
        process.exit(1)
    }

}

function setParam(param, value) {
    let _params = readParam();
    if (param === 'key' || param === 'proxy') {
        util.confirm(util.chalk.red(`Are you sure to set ${param} = ${value}?`))
            .then(function (answers) {
                if (answers.ok) {
                    _params[`${param}`] = value;
                    fs.writeFile(rcfile, JSON.stringify(_params), {
                        encoding: 'utf8',
                        flag: 'w+'
                    }, function (error) {
                        if (error) throw error;
                        console.log(util.chalk.green(`\'${param}\' saved successful!`));
                        process.exit(1);
                    })
                } else {
                    console.log('Operation Canceled!');
                    process.exit(1);
                }
            })
    } else {
        console.error(util.chalk.bgRed(`no such param`));
    }
}

module.exports = {
    readParam,
    listParam,
    setParam
};