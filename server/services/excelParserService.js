/**
 * Created by sajibsarkar on 11/23/17.
 */

'use strict';

const  _       = require('lodash');
const XLSX     = require('xlsx');

/***
 * Effecttively parse  the  excel file and  map to the supplied columns
 * @param contentPath
 * @param jsonDataKeys
 * @returns {Promise}
 */
module.exports.parseBinaryFile = function (contentPath, params) {
    return  new  Promise((resolve, reject) =>  {
        setImmediate(() => {
            let workbook, tableData  =  {};
            let jsonDataKeys = [];
            if (params.jsonDataKeys){
                jsonDataKeys  =  params.jsonDataKeys;
            }
            let sheetMapper =  params.sheetMapper ?  _.cloneDeep(params.sheetMapper) : {};
            let sheetMapperKeys = Object.keys(sheetMapper);

            try {
                workbook = XLSX.read(contentPath,  {type:'base64', cellDates: true });
            } catch(ex){
                console.log('Error at  parsing excel file content',  ex);
                return reject(new Error('Unable to parse  the provided file.'))
            }

            if (workbook && Array.isArray(workbook.SheetNames)) {
                workbook.SheetNames.forEach(function (sheetName, index) {
                    if (isSheetAllowed(sheetMapperKeys, sheetName)) {
                        let worksheet = workbook.Sheets[sheetName];
                        if (worksheet) {
                            let nickName =  sheetMapper[sheetName.toLowerCase()] ? _.camelCase(sheetMapper[sheetName.toLowerCase()].name) : (sheetMapper.all && sheetMapper.all.name? _.camelCase(sheetMapper.all.name) : 'data');

                            tableData[nickName] = [];
                            let refDataTable = tableData[nickName];
                            let dataByRowIndex = _getDataByRow(worksheet);
                            Object.keys(dataByRowIndex).forEach(function (rowKey) {
                                let row = _collectRowData(dataByRowIndex, rowKey);
                                if (row.length > 0) {
                                    let rowItem = {};
                                    let rowLen = row.length;
                                    for (let i = 0; i < rowLen; i++) {
                                        if(jsonDataKeys[nickName] && jsonDataKeys[nickName][i]){
                                            rowItem[jsonDataKeys[nickName][i]] = row[i];
                                        }
                                    }
                                    refDataTable.push(rowItem);
                                }
                            });
                        }
                    }
                });
            }
            resolve(tableData);
        });
    });
};


/**
 * Private methods
 */

/***
 * Get column position based on Letters
 * @param val
 * @returns {number}
 */
function getColumnAlphabetIndex (val) {
    let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;
    let  valLen = val.length;
    for (i = 0, j = val.length - 1; i < valLen; i += 1, j -= 1) {
        result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
    }
    return result -1;
}





function _getDataByRow(worksheet) {
    let keys = Object.keys(worksheet);
    let formattedKeydata = keys.map(function (item) {
        let cellIndex = item.replace(/[A-Z]*/gi, '');
        let colIndex = item.replace(/[0-9]*/gi, '');
        return {
            rowIndex: cellIndex,
            colIndex: colIndex,
            colIndexNumeric: getColumnAlphabetIndex(colIndex),
            data: worksheet[item]
        };
    });

    let dataByRowIndex = _.groupBy(formattedKeydata, 'rowIndex');
    return dataByRowIndex;
}

/***
 * Collect the data array from row
 * @param dataByRowIndex
 * @param rowKey
 * @returns {Array}
 * @private
 */
function _collectRowData(dataByRowIndex, rowKey) {
    let row = [];
    let rowItems = dataByRowIndex[rowKey];
    let rowItemsByNumericColIndex = _.keyBy(rowItems, 'colIndexNumeric');
    if (rowKey && Array.isArray(rowItems)) {
        let lastCellIndex;
        let lastCellItem = _.last(rowItems);
        if (lastCellItem) {
            lastCellIndex = lastCellItem.colIndexNumeric;
        }
        for (let i = 0; i <= lastCellIndex; i++) {
            let indStr = i.toString();
            if (rowItemsByNumericColIndex[indStr]) {
                let __val = rowItemsByNumericColIndex[indStr].data.v;
                row[i] = __val;
            } else {
                row[i] = '';
            }
        }
    }
    return row;
}

/***
 * Test  if the  sheet is  ok to parse
 * @param sheetMapperKeys
 * @param sheetName
 * @returns {boolean}
 */
function isSheetAllowed(sheetMapperKeys, sheetName) {

    if (!sheetMapperKeys.length){
        return true;
    }

    if(sheetMapperKeys.length === 1 && _.head(sheetMapperKeys).toLowerCase() === 'all' ){
        return true;
    }
    return (sheetMapperKeys.length > 0 && sheetMapperKeys.find((keyName) => {
        return new RegExp(keyName, 'i').test(sheetName)
    }));

    return false;
}