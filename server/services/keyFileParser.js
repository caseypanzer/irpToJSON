/**
 * Created by sajibsarkar on 11/23/17.
 */


'use strict';
const fs   = require('fs');
const fse  = require('fs-extra');
const  _ = require('lodash');
const path = require('path');
const XLSX = require('xlsx');
const moment = require('moment');
const jsonfile = require('jsonfile');



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
                    let refSheetName = sheetName;
                    refSheetName = _.camelCase(refSheetName.replace(/tab$/i, ''));
                    tableData[refSheetName] = [];
                    let refDataTable = tableData[refSheetName];
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
            jsonfile.writeFileSync(path.join(__dirname,'/../input-files/','keyNames.json'), jsonKeys, {spaces: 4});
            resolve();
        }).catch(ex => reject(ex));
    });
};
