/**
 * Created by sajibsarkar on 11/17/17.
 */

'use strict';

const _ = require('lodash');
const moment = require('moment');
const sortKeys = require('sort-keys');
const financialSheetMapper  = require('../financialSheetMap').financialSheetMapper;

let mWorkerFarm = require('../lib/mWorkerFarm');
let financialParserWorker = mWorkerFarm.getShared({ workerPath: './parserWorker' });


function _buildPropertyData(financialData, propertyData) {
    if (Array.isArray(financialData)) {
        financialData = financialData.map(function (item) {
            if (item.startDate && !moment.isDate(item.startDate)) {
                item.startDate = moment(item.startDate, 'YYYYMMDD').toDate();
            }
            if (item.endDate && !moment.isDate(item.endDate)) {
                item.endDate = moment(item.endDate, 'YYYYMMDD').toDate();
            }
            return item;
        });

        let financialGroupedData = _.groupBy(financialData, function (item) {
            return _.trim(item.propertyId);
        });

        // console.log('financialGroupedData', financialGroupedData);
        if (Array.isArray(propertyData)) {
            propertyData = propertyData.map(function (propertyItem) {
                if (propertyItem.distributionDate) {
                    propertyItem.distributionDate = moment(propertyItem.distributionDate, 'YYYYMMDD').toDate();
                }
                let foreignKey = _.trim(propertyItem.propertyId);
                if (financialGroupedData[foreignKey]) {
                    let financialDataRows = financialGroupedData[foreignKey];
                    if (Array.isArray(financialDataRows)) {
                        let _financialDataGrouped = _.groupBy(financialDataRows, function (item) {
                            return [item.startDate, item.endDate].join('##');
                        });

                        let groupedKeys = Object.keys(_financialDataGrouped);
                        groupedKeys = _.sortBy(groupedKeys, function (item) {
                            let splittedDate = item.split('##');
                            if (splittedDate.length > 0) {
                                return new Date(item.split('##')[0]).getTime();
                            }
                            return 0;
                        });

                        groupedKeys.forEach(function (keyItem) {
                            let newFinancialItem = {
                                lineItems: {}
                            };
                            let lineItems = [];
                            let splittedItem = keyItem.split('##');
                            newFinancialItem.startDate = splittedItem[0];
                            newFinancialItem.endDate = splittedItem[1];
                            _financialDataGrouped[keyItem].forEach(function (__item) {
                                lineItems.push(__item);
                                if (__item.propertyId && !newFinancialItem.propertyId) {
                                    newFinancialItem.propertyId = __item.propertyId;
                                }
                            });

                            let newLineItem = {};
                            let lineItemsByStmtType = _.groupBy(lineItems, 'stmtType');
                            for (let stmtTyeKey in lineItemsByStmtType) {
                                newLineItem[stmtTyeKey] = lineItemsByStmtType[stmtTyeKey];
                            }
                            newFinancialItem.lineItems = newLineItem;

                            // console.log('lineItems', newFinancialItem.lineItems);
                            // newFinancialItem.lineItems = lineItems;
                            if (!propertyItem.financials) {
                                propertyItem.financials = [];
                            }
                            propertyItem.financials.push(_.pick(newFinancialItem, 'startDate', 'endDate', 'propertyId', 'lineItems'));
                        });
                    }
                }

                if (!propertyItem.financials) {
                    propertyItem.financials = [];
                }
                return propertyItem;
            });
        }
    }
    return propertyData;
}

module.exports.processInputFiles = async function(params) {
    return new Promise((resolve, reject) => {

        let { loanFile, serviceFile, lperFile } = params;
        let errors = [];
        let loanCollections = [];
        let propertyFinanceData = [],
            propertyData= [],
            financialData =[],
            lperData = [];

        if (!loanFile) {
            return reject(new Error('loanFile parameter is missing'));
        }
        if (!serviceFile) {
            return reject(new Error('serviceFile parameter is missing'));
        }

        let _innerPromises = [];

        loanFile.map(function (__loanFile) {
            _innerPromises.push(
                financialParserWorker.run('parseLoanFile', __loanFile, { isLoanFile: true }).then(loans => {
                    if(Array.isArray(loans)){
                        loans.map((_loan)=>{
                            loanCollections.push(_loan);
                        });
                    }
                    return { loanData: loans };
                })
            );
        });


        serviceFile.map(file =>
            _innerPromises.push(
                financialParserWorker.run('financialParse', file, {}).then(data => {
                    return { financialData: data };
                })
            )
        );

        if (Array.isArray(lperFile)) {
            lperFile.map(__lperFile =>
                _innerPromises.push(
                    financialParserWorker.run('parseLperFile', __lperFile, {}).then(lperDataItem => {
                        if (Array.isArray(lperDataItem)) {
                            lperDataItem.forEach(function(__data) {
                                lperData.push(sortKeys(__data, { deep: true }));
                            });
                        }
                        return { lperData: lperDataItem };
                    })
                )
            );
        }

        Promise.all(_innerPromises)
            .then(dataCollection => {
                loanFile = null;
                serviceFile=null;
                lperFile=null;
                let allFinanceData = {};
                if (Array.isArray(dataCollection)) {
                    dataCollection.forEach(function(_financeData) {
                        if (_financeData && _financeData.financialData) {
                            Object.keys(_financeData.financialData).forEach(function(_keyName) {
                                if (!allFinanceData[_keyName]) {
                                    allFinanceData[_keyName] = [];
                                }
                                if (Array.isArray(_financeData.financialData[_keyName])) {
                                    _financeData.financialData[_keyName].forEach(function(dataItem) {
                                        allFinanceData[_keyName].push(dataItem);
                                    });
                                }
                            });
                        }
                    });
                }
                console.log('Completed call for workerFarm.processFiles');
                if (allFinanceData) {
                    propertyFinanceData = allFinanceData;
                    propertyData = propertyFinanceData.property;
                    financialData = propertyFinanceData.financial;
                }
                return propertyFinanceData;
            })
            .then(__propertyFinanceData => {
                let propertyGroupData, __propertyDataMap, __lperDataMap;
                propertyData = _buildPropertyData(financialData, propertyData);

                if (Array.isArray(lperData)) {
                    __lperDataMap = _.groupBy(lperData, function(item) {
                        return [_.trim(item.loanId), _.trim(item.prospectusLoanId)].join('-');
                    });
                }

                //console.log('Total number  of  propertyData', _.size(propertyData));
                propertyGroupData = _.groupBy(propertyData, function(item) {
                    return [_.trim(item.loanId), _.trim(item.prospectusLoanId)].join('-');
                });

                loanCollections = _.sortBy(loanCollections, function(loanItem) {
                    if (loanItem && loanItem.loanId) {
                        return parseInt(loanItem.loanId.toString());
                    }
                    return null;
                });
                if (Array.isArray(loanCollections)) {
                    loanCollections = loanCollections.map(function(loanItem) {
                        if (loanItem) {
                            if (!Array.isArray(loanItem.properties)) {
                                loanItem.properties = [];
                            }
                            let loanForeignKey = [_.trim(loanItem.loanId), _.trim(loanItem.prospectusLoanId)].join('-');
                            if (propertyGroupData && propertyGroupData[loanForeignKey]) {
                                propertyGroupData[loanForeignKey].forEach(function(dataItem) {
                                    loanItem.properties.push(dataItem);
                                });
                            } else {
                                errors.push({type:'asset', message: `No asset data was found for the investment data with loanId-prospectusId ${loanForeignKey}`});
                                //console.log('loan data not found for the  loanForeignKey', loanForeignKey);
                            }
                            if (__lperDataMap && __lperDataMap[loanForeignKey]) {
                                loanItem.loanPeriodicUpdate = __lperDataMap[loanForeignKey];
                            }
                        }
                        return loanItem;
                    });
                }

                let loansMapByLoanId = _.groupBy(loanCollections, item=> _.trim(item.loanId));
                if(Array.isArray(propertyData)){
                    propertyData.map(function (_propertyItem) {
                        if(_propertyItem &&  _propertyItem.loanId && _.toLower(_propertyItem.loanId) !== 'loan id'){
                            if(!loansMapByLoanId[_.trim(_propertyItem.loanId)]){
                                errors.push({type:'investment', message: `There was no Investment data available for the asset data with loanId ${_propertyItem.loanId}`});
                            }
                        }
                    });
                }

                loansMapByLoanId = undefined;

                let otherPropertyKeys = Object.keys(propertyFinanceData).filter(item => item !== 'property' && item !== 'financial');
                loanCollections = loanCollections.map(function(loanItem) {
                    otherPropertyKeys.forEach(function(keyName) {
                        if (!Array.isArray(loanItem[keyName])) {
                            loanItem[keyName] = [];
                        }
                    });
                    return loanItem;
                });
                otherPropertyKeys.forEach(function(dataKey) {
                    if (propertyFinanceData[dataKey].length > 0) {
                        if (financialSheetMapper[dataKey] && financialSheetMapper[dataKey].primaryKey) {
                            let _primaryKey = financialSheetMapper[dataKey].primaryKey;
                            let _groupedData;
                            if (_primaryKey === 'loanId') {
                                _groupedData = _.groupBy(propertyFinanceData[dataKey], function(loanItem) {
                                    return _.trim(loanItem.loanId);
                                });

                                //let groupKeys = Object.keys(_groupedData);
                                if (_groupedData) {
                                    loanCollections = loanCollections.map(function(loanItem) {
                                        let __loanPrimaryKey = _.trim(loanItem.loanId);
                                        if (_groupedData[__loanPrimaryKey]) {
                                            _groupedData[__loanPrimaryKey].forEach(function(dataItem) {
                                                // console.log('loanId',dataKey, dataItem.loanId);
                                                dataItem.startDate = new Date().toDateString();
                                                loanItem[dataKey].push(dataItem);
                                            });
                                        }
                                        return loanItem;
                                    });
                                }
                            } else if (_primaryKey === 'propertyId') {
                                _groupedData = _.groupBy(propertyFinanceData[dataKey], function(loanItem) {
                                    return _.trim(loanItem.propertyId);
                                });

                                // let groupKeys = Object.keys(_groupedData);
                                if (_groupedData) {
                                    __propertyDataMap = _.groupBy(propertyData, function(item) {
                                        return _.trim(item.propertyId);
                                    });

                                    Object.keys(_groupedData).forEach(function(__key) {
                                        if (__propertyDataMap[__key]) {
                                            __propertyDataMap[__key].forEach(function(propertyDataItem) {
                                                if (!Array.isArray(propertyDataItem[dataKey])) {
                                                    propertyDataItem[dataKey] = [];
                                                }
                                                _groupedData[__key].forEach(function(item) {
                                                    item.startDate = new Date().toDateString();
                                                    propertyDataItem[dataKey].push(item);
                                                });
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
                //console.log(loanCollections[0]);
                resolve({ Investments: loanCollections, errors: errors });
            })
            .catch(ex => reject(ex));
    });
};
