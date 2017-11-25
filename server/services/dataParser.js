/**
 * Created by sajibsarkar on 11/17/17.
 */

'use strict';

const  _           = require('lodash');
const moment       = require('moment');
const excelParserService = require('./excelParserService');
const jsonDataKeys = require('../input-files/keyNames.json');


var financialSheetMapper = {
    "wfcm16c34_201711_property"  :  { name : "property" },
    "wfcm16c34_201711_financial" :  { name: "financial" }
};

module.exports.processInputFiles = function (params) {

    return  new Promise((resolve, reject) => {
        let  loanFile   = params.loanFile;
        let serviceFile = params.serviceFile;
        let loanCollections = [];
        let propertyData,  financialData;

        if(!loanFile){
            return reject(new Error("loanFile parameter is missing"))
        }
        if (!serviceFile){
            return reject(new Error("serviceFile parameter is missing"))
        }

        module.exports.parseLoanFile(loanFile).then((loans)=> {
            loanCollections = loans;
            return  module.exports.parsePropertyFinancialData(serviceFile);
        }).then((propertyFinanceData)=> {
            if (propertyFinanceData) {
                propertyData = propertyFinanceData.property;
                financialData = propertyFinanceData.financial;
            }
            let propertyGroupData;
            if (Array.isArray(financialData)){
                financialData = financialData.map(function (item) {
                    if  (item.startDate ){
                        item.startDate = moment(item.startDate, 'YYYYMMDD').toDate();
                    }
                    if  (item.endDate){
                        item.endDate = moment(item.endDate, 'YYYYMMDD').toDate();
                    }
                    return item;
                });
                let financialGroupedData = _.groupBy(financialData, function (item) {
                    return _.trim(item.propertyId);
                });
                if(Array.isArray(propertyData)){
                    propertyData = propertyData.map(function (propertyItem) {
                        if  (propertyItem.distributionDate){
                            propertyItem.distributionDate = moment(propertyItem.distributionDate, 'YYYYMMDD').toDate();
                        }

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
                    propertyGroupData = _.groupBy(propertyData,  function (item) {
                        return [_.trim(item.loanId) , _.trim(item.prospectusLoanId)].join('-');
                    });
                }
            }
            if(Array.isArray(loanCollections)){
                loanCollections = loanCollections.map(function (loanItem) {
                    if(loanItem){
                        let  loanForeignKey = [_.trim(loanItem.loanId), _.trim(loanItem.prospectusLoanId)].join('-');
                        if (propertyGroupData && propertyGroupData[loanForeignKey]){
                            loanItem.properties = propertyGroupData[loanForeignKey];
                        }  else {
                            loanItem.properties = [];
                        }
                    }
                    return  loanItem;
                });
            }
            resolve({Investments : loanCollections});
        }).catch(ex=> reject(ex));
    });
};




module.exports.parsePropertyFinancialData= function (file) {
    return new Promise((resolve, reject) => {
        let parsedFileContent =  getFileFromBas64String(file);
        let contentPath = parsedFileContent.base64String;
        excelParserService.parseBinaryFile(contentPath, {jsonDataKeys: jsonDataKeys,  sheetMapper: financialSheetMapper}).then((refDataTable) => resolve(refDataTable)).catch(err => reject(err));
    });
};


/***
 * Parse the loan tab data   from tsv file
 * @returns {Promise}
 */
module.exports.parseLoanFile = function (file) {
    return   new Promise((resolve,  reject) => {
        let parsedFileContent =  getFileFromBas64String(file);
        let contentPath = parsedFileContent.base64String;
        let sheetMapper = {
            "all"  :  { name : "loan" }
        };

        excelParserService.parseBinaryFile(contentPath, {jsonDataKeys: jsonDataKeys,  sheetMapper: sheetMapper}).then((refDataTable) => resolve(refDataTable.loan)).catch(err => reject(err));
    });
};



function getColumnAlphabetIndex (val) {
    var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;
    for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
        result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
    }
    return result -1;
}


function getFileFromBas64String(fileText) {
    let bas64Marker = ";base64,";
    let bas64MarkerIndex = fileText.indexOf(bas64Marker);
    let rawBase64String  =  fileText.substring(bas64MarkerIndex+bas64Marker.length);
    let contentType = fileText.substring(0, bas64MarkerIndex).replace(/^data:/,'');
    return {
        fileType: contentType,
        base64String : rawBase64String
    };
}