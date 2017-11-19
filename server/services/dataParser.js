/**
 * Created by sajibsarkar on 11/17/17.
 */

'use strict';
const fs   = require('fs');
const fse  = require('fs-extra');
const  _ = require('lodash');
const path = require('path');
const XLSX = require('xlsx');
const moment = require('moment');
const jsonfile = require('jsonfile');

const jsonDataKeys = require('../input-files/keyNames.json');

var dateRegexStr = /^(?:(?:(?:0?[13578]|1[02])(\/|-|\.)31)\1|(?:(?:0?[1,3-9]|1[0-2])(\/|-|\.)(?:29|30)\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:0?2(\/|-|\.)29\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:(?:0?[1-9])|(?:1[0-2]))(\/|-|\.)(?:0?[1-9]|1\d|2[0-8])\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;


module.exports.processInputFiles = function (params) {


    return  new Promise((resolve, reject) => {

        let  loanFile   = params.loanFile;
        let serviceFile = params.serviceFile;


        var loanCollections = [];
        module.exports.parseTSVFile(loanFile).then((loans)=>{
            loanCollections = loans;
            return module.exports.parsePropertyFinanceData(serviceFile);
        }).then((propertyFinanceData) => {

            if (propertyFinanceData){


            let  propertyData = propertyFinanceData.property;
            let  financialData = propertyFinanceData.financial;


            let financialGroupedData = _.groupBy(financialData, function (item) {
                return _.trim(item.propertyId);
            });

           // console.log('propertyData.length ', propertyData.length);
            //console.log('financialGroupedData.length ', Object.keys(financialGroupedData).length);
            propertyData = propertyData.map(function (propertyItem) {
                let  foreignKey = _.trim(propertyItem.propertyId);
                if(financialGroupedData[foreignKey]){
                    let financialDataRows = financialGroupedData[foreignKey];
                    if(Array.isArray(financialDataRows)){
                        let  _financialDataGrouped = _.groupBy(financialDataRows, function (item) {
                            return [item.startDate, item.endDate].join('##');
                        });

                        let groupedKeys = Object.keys(_financialDataGrouped);
                        groupedKeys = _.sortBy(groupedKeys, function (item) {
                            let splittedDate = item.split('##');
                            if(splittedDate.length  > 0){
                                return new Date(item.split('##')[0]).getTime();
                            }
                            return 0;
                        });

                        groupedKeys.forEach(function (keyItem) {
                            //console.log(keyItem);
                            let newFinancialItem= {
                                lineItems : []
                            };
                            let  splittedItem = keyItem.split('##');
                            newFinancialItem.startDate = splittedItem[0];
                            newFinancialItem.endDate = splittedItem[1];
                            _financialDataGrouped[keyItem].forEach(function (__item) {
                                newFinancialItem.lineItems.push(__item);
                                if(__item.propertyId &&  !newFinancialItem.propertyId){
                                    newFinancialItem.propertyId = __item.propertyId;
                                }
                            });

                            if (!propertyItem.financials){
                                propertyItem.financials = [];
                            }
                            propertyItem.financials.push(_.pick(newFinancialItem, 'startDate', 'endDate', 'propertyId', 'lineItems'));
                        });
                    }

                }

                if (!propertyItem.financials){
                    propertyItem.financials = [];
                }
                return  propertyItem;
            });
            let propertyGroupData = _.groupBy(propertyData,  function (item) {
                return [_.trim(item.loanId) , _.trim(item.prospectusLoanId)].join('-');
            });
            loanCollections = loanCollections.map(function (loanItem) {
                let  loanForeignKey = [_.trim(loanItem.loanId), _.trim(loanItem.prospectusLoanId)].join('-');
                if (propertyGroupData[loanForeignKey]){
                    loanItem.properties = propertyGroupData[loanForeignKey];
                }  else {
                    loanItem.properties = [];
                }
                return  loanItem;
            });


            //jsonfile.writeFileSync(path.join(__dirname,'/../outputs/','investments.json'), {  Investments : loanCollections}, {spaces: 4});
            }
           // console.log('loanCollections size', loanCollections.length )
            resolve({  Investments : loanCollections});

        }).catch(err => reject(err));

    });
};




module.exports.parsePropertyFinanceData= function (file) {
    return new Promise((resolve, reject) => {
            let tableData = {};
            fse.ensureDirSync(__dirname+'/../outputs');
            let contentPath = path.join(__dirname ,'/../../', file.path);
            let workbook = XLSX.readFile(contentPath);
            if (workbook && Array.isArray(workbook.SheetNames)) {
                workbook.SheetNames.forEach(function (sheetName, index) {
                    if (/WFCM16C34_201711_property/i.test(sheetName) || /WFCM16C34_201711_financial/i.test(sheetName)){
                        var worksheet = workbook.Sheets[sheetName];
                        if (worksheet) {
                            let nickName = /property$/.test(sheetName) ? 'property': 'financial';
                            tableData[nickName] = [];
                            let refDataTable = tableData[nickName];
                            var keys = Object.keys(worksheet);
                            var formattedKeydata = keys.map(function (item) {
                                var cellIndex = item.replace(/[A-Z]*/gi, '');
                                var colIndex = item.replace(/[0-9]*/gi, '');
                                return {
                                    rowIndex        : cellIndex,
                                    colIndex        : colIndex,
                                    colIndexNumeric : getColumnAlphabetIndex(colIndex),
                                    data            : worksheet[item]
                                };
                            });
                            var dataByRowIndex = _.groupBy(formattedKeydata, 'rowIndex');
                            Object.keys(dataByRowIndex).forEach(function (rowKey) {
                                // console.log('dataByRowIndex[rowKey]', dataByRowIndex[rowKey]);
                                var rowItems = dataByRowIndex[rowKey];
                                var rowItemsByNumericColIndex = _.keyBy(rowItems, 'colIndexNumeric');
                                var row = [];
                                if (rowKey && Array.isArray(rowItems)) {
                                    var firstCellIndex, lastCellIndex;
                                    var lastCellItem = _.last(rowItems);
                                    if (lastCellItem) {
                                        lastCellIndex = lastCellItem.colIndexNumeric;
                                    }
                                    //console.log('firstCellIndex, lastCellIndex', firstCellIndex, lastCellIndex);
                                    for (var i = 0; i <= lastCellIndex; i++) {
                                        var indStr = i.toString();
                                        if (rowItemsByNumericColIndex[indStr]) {
                                            var __val = rowItemsByNumericColIndex[indStr].data.v;
                                            if (rowItemsByNumericColIndex[indStr].data.t === 'n') {
                                                if (new RegExp(dateRegexStr).test(rowItemsByNumericColIndex[indStr].data.w)) {
                                                    __val = moment(new Date(( +(__val) - (25567 + 2)) * 86400 * 1000)).format('MM/DD/YYYY');
                                                }
                                            }
                                            row[i] = __val;
                                        } else {
                                            row[i] = '';
                                        }

                                    }
                                }
                                if (row.length > 0) {
                                    let rowItem= {};

                                    let rowLen = row.length;

                                    for(let i=0; i < rowLen;i ++){
                                        if(nickName === 'property'){
                                            if(jsonDataKeys.propertyTab[i]){

                                                if  (jsonDataKeys.propertyTab[i] === 'distributionDate'){
                                                    if(row[i]){
                                                        row[i] = moment(row[i], 'YYYYMMDD').toDate();
                                                    }
                                                }

                                                rowItem[jsonDataKeys.propertyTab[i]] = row[i];
                                            }
                                        } else if(nickName === 'financial'){
                                            if(jsonDataKeys.financialTab[i]){
                                                if(jsonDataKeys.financialTab[i] === 'startDate' || jsonDataKeys.financialTab[i] === 'endDate'){
                                                    if(row[i]){
                                                        row[i] = moment(row[i], 'YYYYMMDD').toDate();
                                                    }

                                                }
                                                rowItem[jsonDataKeys.financialTab[i]] = row[i];
                                            }
                                        }
                                    }


                                    refDataTable.push(rowItem);
                                }
                            });
                        }

                    }

                });
            }

            //jsonfile.writeFileSync(path.join(__dirname,'/../outputs/','propertyTab.json'), {  data: tableData.property}, {spaces: 4});
          //  jsonfile.writeFileSync(path.join(__dirname,'/../outputs/','financialTab.json'), {  data: tableData.financial}, {spaces: 4});

            setImmediate(()=>{
                resolve(tableData);
            })
    });
};


/***
 * Parse the loan tab data   from tsv file
 * @returns {Promise}
 */
module.exports.parseTSVFile = function (loanFile) {

    return   new Promise((resolve,  reject) => {
        let contentPath = path.join(__dirname ,'/../../', loanFile.path);
        fse.ensureDirSync(__dirname+'/../outputs');
        let refDataTable =  [];
        let workbook = XLSX.readFile(contentPath);
        if (workbook && Array.isArray(workbook.SheetNames)) {
            workbook.SheetNames.forEach(function (sheetName, index) {
                   var worksheet = workbook.Sheets[sheetName];
                    if (worksheet) {

                        var keys = Object.keys(worksheet);
                        var formattedKeydata = keys.map(function (item) {
                            var cellIndex = item.replace(/[A-Z]*/gi, '');
                            var colIndex = item.replace(/[0-9]*/gi, '');
                            return {
                                rowIndex        : cellIndex,
                                colIndex        : colIndex,
                                colIndexNumeric : getColumnAlphabetIndex(colIndex),
                                data            : worksheet[item]
                            };
                        });
                        var dataByRowIndex = _.groupBy(formattedKeydata, 'rowIndex');
                        Object.keys(dataByRowIndex).forEach(function (rowKey) {
                            // console.log('dataByRowIndex[rowKey]', dataByRowIndex[rowKey]);
                            var rowItems = dataByRowIndex[rowKey];
                            var rowItemsByNumericColIndex = _.keyBy(rowItems, 'colIndexNumeric');
                            var row = [];
                            if (rowKey && Array.isArray(rowItems)) {
                                var firstCellIndex, lastCellIndex;
                                var lastCellItem = _.last(rowItems);
                                if (lastCellItem) {
                                    lastCellIndex = lastCellItem.colIndexNumeric;
                                }
                                //console.log('firstCellIndex, lastCellIndex', firstCellIndex, lastCellIndex);
                                for (var i = 0; i <= lastCellIndex; i++) {
                                    var indStr = i.toString();
                                    if (rowItemsByNumericColIndex[indStr]) {
                                        var __val = rowItemsByNumericColIndex[indStr].data.v;
                                        if (rowItemsByNumericColIndex[indStr].data.t === 'n') {
                                            if (new RegExp(dateRegexStr).test(rowItemsByNumericColIndex[indStr].data.w)) {
                                                __val = moment(new Date(( +(__val) - (25567 + 2)) * 86400 * 1000)).format('MM/DD/YYYY');
                                            }
                                        }
                                        row[i] = __val;
                                    } else {
                                        row[i] = '';
                                    }

                                }
                            }
                            if (row.length > 0) {
                                let rowItem= {};

                                let rowLen = row.length;

                                for(let i=0; i < rowLen;i ++){
                                    if(jsonDataKeys.loanTab[i]){
                                        rowItem[jsonDataKeys.loanTab[i]] = row[i];
                                    }
                                }

                                refDataTable.push(rowItem);
                            }
                        });
                    }
            });
        }
        jsonfile.writeFileSync(path.join(__dirname,'/../outputs/','loanTab.json'), {  data: refDataTable}, {spaces: 4});
        resolve(refDataTable);
    });
};

/***
 * Parse  the key files that will be  used to construct  json data
 * @returns {Promise}
 */

module.exports.parseKeyFile = function () {
    return new Promise((resolve, reject) => {
        let tableData = {};
        let contentPath = path.join(__dirname + '/../input-files/fieldNameKeyIrpApp.xlsx');
        let workbook = XLSX.readFile(contentPath);
        if (workbook && Array.isArray(workbook.SheetNames)) {
            workbook.SheetNames.forEach(function (sheetName, index) {
                var worksheet = workbook.Sheets[sheetName];
                if (worksheet) {
                    tableData[_.camelCase(sheetName)] = [];
                    let refDataTable = tableData[_.camelCase(sheetName)];
                    var keys = Object.keys(worksheet);
                    var formattedKeydata = keys.map(function (item) {
                        var cellIndex = item.replace(/[A-Z]*/gi, '');
                        var colIndex = item.replace(/[0-9]*/gi, '');
                        return {
                            rowIndex        : cellIndex,
                            colIndex        : colIndex,
                            colIndexNumeric : getColumnAlphabetIndex(colIndex),
                            data            : worksheet[item]
                        };
                    });
                    var dataByRowIndex = _.groupBy(formattedKeydata, 'rowIndex');
                    Object.keys(dataByRowIndex).forEach(function (rowKey) {
                        var rowItems = dataByRowIndex[rowKey];
                        var rowItemsByNumericColIndex = _.keyBy(rowItems, 'colIndexNumeric');
                        var row = [];
                        if (rowKey && Array.isArray(rowItems)) {
                            var firstCellIndex, lastCellIndex;
                            var lastCellItem = _.last(rowItems);
                            if (lastCellItem) {
                                lastCellIndex = lastCellItem.colIndexNumeric;
                            }
                            for (var i = 0; i <= lastCellIndex; i++) {
                                var indStr = i.toString();
                                if (rowItemsByNumericColIndex[indStr]) {
                                    var __val = rowItemsByNumericColIndex[indStr].data.v;
                                    if (rowItemsByNumericColIndex[indStr].data.t === 'n') {
                                        if (new RegExp(dateRegexStr).test(rowItemsByNumericColIndex[indStr].data.w)) {
                                            __val = moment(new Date(( +(__val) - (25567 + 2)) * 86400 * 1000)).format('MM/DD/YYYY');
                                        }
                                    }
                                    row[i] = __val;
                                } else {
                                    row[i] = '';
                                }

                            }
                        }
                        if (row.length > 0) {
                            refDataTable.push(_.camelCase(_.head(row)));
                        }
                    });
                }

            });
        }

        resolve(tableData);
    });
};


module.exports.parseAndStoreKeyFileAsJSON = function () {

    return new Promise((resolve,  reject) => {
        module.exports.parseKeyFile().then(function (jsonKeys) {
            jsonDataKeys = jsonKeys;
            jsonfile.writeFileSync(path.join(__dirname,'/../input-files/','keyNames.json'), jsonDataKeys, {spaces: 4});
            resolve();
        }).catch(ex => reject(ex));
    });

};

function getColumnAlphabetIndex (val) {

    var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;

    for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
        result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
    }

    return result -1;

}