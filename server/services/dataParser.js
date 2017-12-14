/**
 * Created by sajibsarkar on 11/17/17.
 */

'use strict';

const  _           = require('lodash');
const moment       = require('moment');
const excelParserService = require('./excelParserService');
const jsonDataKeys = require('../input-files/keyNames.json');

const financialSheetMapper               = {
    "wfcm16c34_201711_property"          : { name: "property" },
    "wfcm16c34_201711_financial"         : { name: "financial" },
    'tccomparativefinancialstatusirp'    : { name: 'tccomparativefinancialstatusirp', isHeaderRowExists: true, primaryKey: 'loanId'  },
    'rptddelinquentloanstatus'           : { name: 'rptddelinquentloanstatus' , isHeaderRowExists: true, primaryKey: 'loanId' },
    'rptmhistoricalloanmod'              : { name: 'rptmhistoricalloanmod', isHeaderRowExists: true, primaryKey: 'loanId'  },
    'rptrsvloc'                          : { name: 'rptrsvloc', isHeaderRowExists: true, primaryKey: 'loanId'  },
    'rptreostatus'                       : { name: 'rptreostatus' , isHeaderRowExists: true, primaryKey: 'propertyId' },
    'rptwservicerwatchlistirp'           : { name: 'rptwservicerwatchlistirp', isHeaderRowExists: true , primaryKey: 'loanId'  },
    'tlr'                                : { name: 'tlr', isHeaderRowExists: true, primaryKey: 'loanId'  },
    'rptadvrecovery'                     : { name: 'rptadvrecovery', isHeaderRowExists: true,  primaryKey: 'loanId'  }
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

            let _promises = [];

            serviceFile.forEach(function (_serviceFile) {
                _promises.push(module.exports.parsePropertyFinancialData(_serviceFile));
            });

            return Promise.all(_promises).then(function (_financeDataCollection) {
                let allFinanceData = {};

                if(Array.isArray(_financeDataCollection)){
                    _financeDataCollection.forEach(function (_financeData) {
                        console.log('Object.keys(_financeData)', Object.keys(_financeData));
                        Object.keys(_financeData).forEach(function (_keyName) {
                            if(!allFinanceData[_keyName]){
                                allFinanceData[_keyName] = [];
                            }
                            if(Array.isArray(_financeData[_keyName])){
                                _financeData[_keyName].forEach(function (dataItem) {
                                    allFinanceData[_keyName].push(dataItem);
                                })
                            }
                        });
                    })
                }

                return allFinanceData;
            });

        }).then((propertyFinanceData)=> {
            if (propertyFinanceData) {
                propertyData   = propertyFinanceData.property;
                financialData  = propertyFinanceData.financial;
            }
            let propertyGroupData;
            if (Array.isArray(financialData)){
                financialData = financialData.map(function (item) {
                    if  (item.startDate && !moment.isDate(item.startDate)){
                        item.startDate = moment(item.startDate, 'YYYYMMDD').toDate();
                    }
                    if  (item.endDate && !moment.isDate(item.endDate)){
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
                        if(!Array.isArray(loanItem.properties)){
                            loanItem.properties = [];
                        }
                        let  loanForeignKey = [_.trim(loanItem.loanId), _.trim(loanItem.prospectusLoanId)].join('-');
                        if (propertyGroupData && propertyGroupData[loanForeignKey]){

                            propertyGroupData[loanForeignKey].forEach(function (dataItem) {
                                loanItem.properties.push(dataItem);
                            });
                        }
                    }
                    return  loanItem;
                });
            }

            let  otherPropertyKeys = Object.keys(propertyFinanceData).filter(item => item !== 'property' && item !== 'financial');

            loanCollections = loanCollections.map(function (loanItem) {
                otherPropertyKeys.forEach(function (keyName) {
                    if(!Array.isArray(loanItem[keyName])) {
                        loanItem[keyName] = [];
                    }
                });
                return loanItem;
            });


            otherPropertyKeys.forEach(function (dataKey) {
                if(propertyFinanceData[dataKey].length >0 ){
                    if (financialSheetMapper[dataKey] && financialSheetMapper[dataKey].primaryKey){

                        let _primaryKey = financialSheetMapper[dataKey].primaryKey;

                        let  _groupedData;
                        if(_primaryKey === 'loanId'){

                            _groupedData = _.groupBy(propertyFinanceData[dataKey],function (loanItem) {
                                return [_.trim(loanItem.loanId) , _.trim(loanItem.prospectusLoanId)].join('-');
                            });

                            // let groupKeys = Object.keys(_groupedData);

                            if(_groupedData){
                                loanCollections = loanCollections.map(function (loanItem) {
                                    let __loanPrimaryKey = [_.trim(loanItem.loanId) , _.trim(loanItem.prospectusLoanId)].join('-');
                                    if(_groupedData[__loanPrimaryKey]){
                                        _groupedData[__loanPrimaryKey].forEach(function (dataItem) {
                                            console.log('prospectusLoanId',dataKey, dataItem.paidThruDate);

                                            if(!dataItem.startDate){
                                                if(dataItem.paidThruDate){
                                                    dataItem.startDate = dataItem.paidThruDate;
                                                } else {
                                                    dataItem.startDate = new Date();
                                                }
                                            }

                                            loanItem[dataKey].push(dataItem);
                                        });
                                       // console.log(dataKey, __loanPrimaryKey, loanItem[dataKey]);
                                    }
                                    return  loanItem;
                                });
                            }
                        } else if(_primaryKey === 'propertyId'){




                        }



                        /*groupKeys.forEach(function (keyName) {
                            if(loanCollectionMap[keyName]){
                                let _propertyName = keyName;
                                if(!Array.isArray(loanCollectionMap[keyName][_propertyName])){
                                    loanCollectionMap[keyName][_propertyName] = [];
                                }

                                _groupedData[keyName].forEach(function (_groupDataItem) {
                                    loanCollectionMap[keyName][_propertyName].push(_groupDataItem);
                                });

                            }
                        });*/


                       // console.log('propertyFinanceData[dataKey]._groupedData', groupKeys);
                    }

                }
            });

            //console.log(loanCollections);

            loanCollections = _.sortBy(loanCollections, function (loanItem) {
                return parseInt(loanItem.loanId.toString());
            });
            resolve({Investments : loanCollections});
        }).catch(ex=> reject(ex));
    });
};




module.exports.parsePropertyFinancialData= function (file) {
    return new Promise((resolve, reject) => {
        let parsedFileContent =  getFileFromBas64String(file);
        let contentPath = parsedFileContent.base64String;
        excelParserService.parseFinancialBinaryFile(contentPath, {jsonDataKeys: jsonDataKeys,  sheetMapper: financialSheetMapper}).then((refDataTable) => resolve(refDataTable)).catch(err => reject(err));
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
