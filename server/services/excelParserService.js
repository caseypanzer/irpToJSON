/**
 * Created by sajibsarkar on 11/23/17.
 */

'use strict';

const  _       = require('lodash');
const XLSX     = require('xlsx');
const lperFileParserService = require('./lperFileParserService');
const moment = require('moment');

/***
 * Effecttively parse  the  excel file and  map to the supplied columns
 * @param file
 * @param jsonDataKeys
 * @returns {Promise}
 */
module.exports.parseBinaryFile = function (file, params) {
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
                workbook = XLSX.readFile(file.path,  { type:'binary', cellDates: true });
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
                    } else{
                        console.log('sheetName was not allowed',sheetName );
                    }
                });
            }
            //console.log('tableData', tableData);
            resolve(tableData);
        });
    });
};


module.exports.parseFinancialBinaryFile = function (file, params) {
    return  new  Promise((resolve, reject) =>  {
            let workbook, tableData  =  {};
            let jsonDataKeys = {};
            if (params.jsonDataKeys){
                jsonDataKeys  =  params.jsonDataKeys;
            }
            let sheetMapper =  params.sheetMapper ?  _.cloneDeep(params.sheetMapper) : {};
            let sheetMapperKeys = Object.keys(sheetMapper);
            try {
                workbook = XLSX.readFile(file.path,  {type:'binary', cellDates: true });
            } catch(ex){
                console.log('Error at  parsing excel file content',  ex);
                return reject(new Error('Unable to parse  the provided file.'))
            }

            //console.log('workbook.SheetNames', workbook.SheetNames);
            if (workbook && Array.isArray(workbook.SheetNames)) {
                workbook.SheetNames.forEach(function (sheetName, index) {
                    let checkResult = isSheetAllowed(sheetMapperKeys, sheetName);
                    let checkResultPropertyName = checkResult.propertyName;
                    if (checkResult && checkResult.isAllowed) {
                        let worksheet = workbook.Sheets[sheetName];
                        if (worksheet) {
                            let nickName =  sheetMapper[checkResultPropertyName] ? _.camelCase(sheetMapper[checkResultPropertyName].name) : (sheetMapper.all && sheetMapper.all.name? _.camelCase(sheetMapper.all.name) : 'data');
                            if(!tableData[nickName] || !Array.isArray(tableData[nickName])){
                                tableData[nickName] = [];
                            }
                            let refDataTable = tableData[nickName];
                            let dataByRowIndex = _getDataByRow(worksheet);
                            if(sheetMapper[checkResultPropertyName] && sheetMapper[checkResultPropertyName].isHeaderRowExists){
                                //console.log(sheetName, jsonDataKeys[sheetName.toLowerCase()]);
                                let jsonKeyMap = jsonDataKeys[checkResultPropertyName];
                                let headersIndex = [];
                                if (jsonKeyMap){

                                    //console.log('jsonKeyMap', jsonKeyMap);
                                    let headerRowIndex;
                                    let _rowData = [];
                                    Object.keys(dataByRowIndex).forEach(function (rowKey) {
                                        let row = _collectRowData(dataByRowIndex, rowKey);
                                        if(row.some((item) => item !== '')){
                                            _rowData.push(row);
                                        }
                                    });

                                    let rowLen = _rowData.length;
                                    for (let i=0; i < rowLen; i++){
                                        let  _cols = _rowData[i];
                                       // console.log('_cols', _cols);
                                        if(hasValidHeaders(_cols, jsonKeyMap)){
                                            headerRowIndex =  i;
                                            for (let indx=0; indx < _cols.length; indx++){
                                                let __colVal = _.camelCase(_cols[indx]);
                                                if(__colVal && jsonKeyMap.indexOf(__colVal) > -1){
                                                    headersIndex[indx] = __colVal;
                                                }
                                            }
                                            //console.log('sheetName, headerRowIndex, headersIndex', sheetName, headerRowIndex, headersIndex );
                                            break;
                                        }

                                    }
                                    if(headersIndex && headersIndex.length  > 0){
                                        headersIndex = headersIndex.map(function (item) {
                                            if(typeof item === 'string'){
                                                item = _.camelCase(item);
                                            }
                                            return item;
                                        });
                                    }

                                    if (typeof headerRowIndex  !== 'undefined' && headerRowIndex !== null){
                                        for (let rIndex= headerRowIndex+1; rIndex < _rowData.length; rIndex++){
                                            let  _cols = _rowData[rIndex];
                                            let  _rowItem = {};
                                            for(let colIndex = 0; colIndex < _cols.length; colIndex++){
                                                if(typeof  headersIndex[colIndex] !== 'undefined'){
                                                    //console.log( headersIndex[colIndex]);
                                                    if(/date/i.test(headersIndex[colIndex]) && /\d{8}/.test( _cols[colIndex])){
                                                        _rowItem[headersIndex[colIndex]] = moment( _cols[colIndex], 'YYYYMMDD').toDate();
                                                        console.log('parsed into date', _rowItem[headersIndex[colIndex]]);
                                                    } else{
                                                        _rowItem[headersIndex[colIndex]] = _cols[colIndex];
                                                    }
                                                }

                                            }
                                            refDataTable.push(_rowItem);
                                        }
                                    }
                                }

                            } else{
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
                    }
                });
            }
            resolve(tableData);
        });
};



module.exports.parseLperFile = function (file, params) {
    return  new  Promise((resolve, reject) =>  {
        setImmediate(() => {
            let workbook, tableData  =  {};
            let jsonDataKeys = {};
            let sheetMapper =  params.sheetMapper ?  _.cloneDeep(params.sheetMapper) : {};
            let sheetMapperKeys = Object.keys(sheetMapper);
            try {
                workbook = XLSX.readFile(file.path,  { type:'binary', cellDates: true });
            } catch(ex){
                console.log('Error at  parsing excel file content',  ex);
                return reject(new Error('Unable to parse  the provided file.'))
            }
            if (workbook && Array.isArray(workbook.SheetNames)) {
                workbook.SheetNames.forEach(function (sheetName, index) {
                    let checkResult = isSheetAllowed(sheetMapperKeys, sheetName);
                    let checkResultPropertyName = checkResult.propertyName;
                    if (checkResult && checkResult.isAllowed) {
                        let worksheet = workbook.Sheets[sheetName];
                        if (worksheet) {
                            let nickName =  sheetMapper[checkResultPropertyName] ? _.camelCase(sheetMapper[checkResultPropertyName].name) : (sheetMapper.all && sheetMapper.all.name? _.camelCase(sheetMapper.all.name) : 'data');
                            tableData = [];
                            let dataByRowIndex = _getDataByRow(worksheet);
                            Object.keys(dataByRowIndex).forEach(function (rowKey) {
                                let row = _collectRowData(dataByRowIndex, rowKey);
                                tableData.push(row);
                            });
                        }
                    }
                });
            }
            resolve(lperFileParserService.mapLperData(tableData));
        });
    });
};
/**
 * Private methods
 */




function hasValidHeaders(_cols, jsonKeyMap) {
    //console.log('jsonKeyMap', jsonKeyMap);
    let  _hasValidHeader = jsonKeyMap.some(function (item) {
        // console.log('item', item);
        return _cols.map(_colVal=> _.camelCase(_colVal)).indexOf(item) > -1;
    });
    return  _hasValidHeader;
}


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

    return _.groupBy(formattedKeydata, 'rowIndex');
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
                row[i] = __val? __val.toString().replace(/\s+/g," ").replace(/^\s+|\s+$/g, '') : '';
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

    let isAllowed = false;
    let  propertyName;

    if (!sheetMapperKeys.length){
        isAllowed  = true;
        return isAllowed;
    }

    if(sheetMapperKeys.length === 1 && _.head(sheetMapperKeys).toLowerCase() === 'all' ){
        propertyName = 'all';
        isAllowed = true;
        return {
            propertyName: propertyName,
            isAllowed:isAllowed
        };
    }
    if(sheetMapperKeys.length > 0 && sheetMapperKeys.find((keyName) => {

        if (keyName === 'property' || keyName === 'financial'){
            if(new RegExp('_'+keyName, 'i').test(sheetName)){
                propertyName = keyName;
                isAllowed = true;
                return true;
            }
        } else  if(new RegExp(keyName+'$', 'i').test(sheetName)){
            propertyName = keyName;
            isAllowed = true;
            return true;
        }
        return false;
    })){
        return  {
            propertyName: propertyName,
            isAllowed:isAllowed
        };
    }


    return  {
        propertyName: propertyName,
        isAllowed:isAllowed
    };
}
