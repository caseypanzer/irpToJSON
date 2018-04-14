/**
 * Created by sajibsarkar on 4/11/18.
 */
require('v8-compile-cache');
const sortKeys = require('sort-keys');
const _ = require('lodash');
let excelParserService = require('../services/excelParserService');

exports.init = function(options, callback) {
    Object.assign(process.env, options.env || {});
    callback();
};

exports.run = function(taskName, file, params, callback) {
    let startTime = Date.now();
    console.log(`Process started as pid: ${process.pid}`);

    let _methodName = taskName === 'financialParse' ? '_processFinancialFile' : '';
    switch (taskName) {
        case 'parseLoanFile':
            _methodName = 'parseLoanFile';
            break;
        case 'financialParse':
            _methodName = '_processFinancialFile';
            break;
        case 'parseLperFile':
            _methodName = 'parseLperFile';
            break;
        case 'default':
            _methodName = taskName;
            break;
    }
    // console.log('_methodName', _methodName);
    exports[_methodName]
        .call(null, file, params)
        .then(results => {
            console.log(`pid: ${process.pid} took time`, Date.now() - startTime);
            _cleanMemory();
            callback(null, results);
        })
        .catch(err => {
            console.log(err);
            _cleanMemory();
            callback(err);
        });
};

/***
 * Parse the loan tab data   from tsv file
 * @returns {Promise}
 */
module.exports.parseLoanFile = function(file, params) {
    return new Promise((resolve, reject) => {
        let parsedFileContent = getFileFromBas64String(file);
        let contentPath = parsedFileContent.base64String;
        let sheetMapper = {
            all: { name: 'loan' }
        };
        //  console.log('contentPath', contentPath);
        excelParserService
            .parseBinaryFile(contentPath, params)
            .then(refDataTable => {
                if (Array.isArray(refDataTable.loan)) {
                    refDataTable.loan = refDataTable.loan.map(function(loanItem) {
                        let newLoanItem = _.pick(loanItem, 'transactionId', 'groupId', 'loanId', 'prospectusLoanId', 'propertyName', 'propertyAddress', 'propertyCity', 'propertyState', 'propertyZipCode', 'propertyCounty', 'propertyType');

                        newLoanItem.loanSetUp = [sortKeys(loanItem, { deep: true })];

                        return newLoanItem;
                    });
                }
                //console.log('refDataTable.loan', refDataTable.loan);
                refDataTable.loan = refDataTable.loan.filter(loanItem => loanItem && loanItem.loanId && loanItem.loanId.length > 4 && loanItem.loanId !== 'Loan Id');
                resolve(refDataTable.loan);
            })
            .catch(err => reject(err));
    });
};

exports._processFinancialFile = function(file, params) {
    return new Promise((resolve, reject) => {
        let parsedFileContent = getFileFromBas64String(file);
        let contentPath = parsedFileContent.base64String;
        excelParserService.parseFinancialBinaryFile(contentPath, params).then(data => resolve(data))
            .catch(err => reject(err));
    });

};

module.exports.parseLperFile = function(file, params) {
    return new Promise((resolve, reject) => {
        let parsedFileContent = getFileFromBas64String(file);
        let contentPath = parsedFileContent.base64String;
        let sheetMapper = {
            all: { name: 'iprs' }
        };
        params.sheetMapper = sheetMapper;
        excelParserService
            .parseLperFile(contentPath, params)
            .then(refDataTable => resolve(refDataTable))
            .catch(err => reject(err));
    });
};

process.on('unhandledRejection', function(err) {
    // ERR_IPC_CHANNEL_CLOSED happens when the worker is killed before it finishes processing
    if (err.code !== 'ERR_IPC_CHANNEL_CLOSED') {
        console.error('Unhandled promise rejection:', err.stack);
    }
});

function getFileFromBas64String(fileText) {
    let bas64Marker = ';base64,';
    let bas64MarkerIndex = fileText.indexOf(bas64Marker);
    let rawBase64String = fileText.substring(bas64MarkerIndex + bas64Marker.length);
    let contentType = fileText.substring(0, bas64MarkerIndex).replace(/^data:/, '');
    return {
        fileType: contentType,
        base64String: rawBase64String
    };
}

function _cleanMemory() {
    setImmediate(() => {
        try {
            global.gc();
        } catch (e) {
            console.log("You must run program with 'node --expose-gc index.js' or 'npm start'");
        }
    });
}
