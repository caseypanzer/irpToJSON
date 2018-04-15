/**
 * Created by sajibsarkar on 11/17/17.
 */

'use strict';

const _ = require('lodash');
const moment = require('moment');
const sortKeys = require('sort-keys');
const jsonDataKeys = require('../input-files/keyNames.json');

Object.keys(jsonDataKeys).forEach(function(keyName) {
    if (Array.isArray(jsonDataKeys[keyName])) {
        jsonDataKeys[keyName] = jsonDataKeys[keyName].map(item => _.camelCase(item));
    }
});

let mWorkerFarm = require('../lib/mWorkerFarm');
let financialParserWorker = mWorkerFarm.getShared({ workerPath: './financialParserWorker' });

const financialSheetMapper = {
    property: { name: 'property' },
    financial: { name: 'financial' },
    tccomparativefinancialstatusirp: { name: 'tccomparativefinancialstatusirp', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptddelinquentloanstatus: { name: 'rptddelinquentloanstatus', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptmhistoricalloanmod: { name: 'rptmhistoricalloanmod', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptrsvloc: { name: 'rptrsvloc', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptreostatus: { name: 'rptreostatus', isHeaderRowExists: true, primaryKey: 'propertyId' },
    rptwservicerwatchlistirp: { name: 'rptwservicerwatchlistirp', isHeaderRowExists: true, primaryKey: 'loanId' },
    rpttotalloan: { name: 'rpttotalloan', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptadvrecovery: { name: 'rptadvrecovery', isHeaderRowExists: true, primaryKey: 'loanId' },
    lpr: { name: 'lpr', isHeaderRowExists: false, primaryKey: 'loanId' }
};

module.exports.processInputFiles = async function(params) {
    return new Promise((resolve, reject) => {
        let { loanFile, serviceFile, lperFile } = params;

        let loanCollections = [];
        let propertyFinanceData,
            propertyData,
            financialData,
            lperData = [];

        if (!loanFile) {
            return reject(new Error('loanFile parameter is missing'));
        }
        if (!serviceFile) {
            return reject(new Error('serviceFile parameter is missing'));
        }
        let sheetMapper = {
            all: { name: 'loan' }
        };

        let _innerPromises = [];

        _innerPromises.push(
            financialParserWorker.run('parseLoanFile', loanFile, { isLoanFile: true, jsonDataKeys: jsonDataKeys, sheetMapper: sheetMapper }).then(loans => {
                loanCollections = loans;
                return { loanData: loans };
            })
        );

        serviceFile.map(file =>
            _innerPromises.push(
                financialParserWorker.run('financialParse', file, { jsonDataKeys: jsonDataKeys, sheetMapper: financialSheetMapper }).then(data => {
                    return { financialData: data };
                })
            )
        );

        if (Array.isArray(lperFile)) {
            lperFile.map(__lperFile =>
                _innerPromises.push(
                    financialParserWorker.run('parseLperFile', __lperFile, { jsonDataKeys: jsonDataKeys }).then(lperDataItem => {
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

                if (Array.isArray(financialData)) {
                    financialData = financialData.map(function(item) {
                        if (item.startDate && !moment.isDate(item.startDate)) {
                            item.startDate = moment(item.startDate, 'YYYYMMDD').toDate();
                        }
                        if (item.endDate && !moment.isDate(item.endDate)) {
                            item.endDate = moment(item.endDate, 'YYYYMMDD').toDate();
                        }
                        return item;
                    });

                    let financialGroupedData = _.groupBy(financialData, function(item) {
                        return _.trim(item.propertyId);
                    });

                    // console.log('financialGroupedData', financialGroupedData);
                    if (Array.isArray(propertyData)) {
                        propertyData = propertyData.map(function(propertyItem) {
                            if (propertyItem.distributionDate) {
                                propertyItem.distributionDate = moment(propertyItem.distributionDate, 'YYYYMMDD').toDate();
                            }

                            let foreignKey = _.trim(propertyItem.propertyId);
                            if (financialGroupedData[foreignKey]) {
                                let financialDataRows = financialGroupedData[foreignKey];
                                if (Array.isArray(financialDataRows)) {
                                    let _financialDataGrouped = _.groupBy(financialDataRows, function(item) {
                                        return [item.startDate, item.endDate].join('##');
                                    });

                                    let groupedKeys = Object.keys(_financialDataGrouped);
                                    groupedKeys = _.sortBy(groupedKeys, function(item) {
                                        let splittedDate = item.split('##');
                                        if (splittedDate.length > 0) {
                                            return new Date(item.split('##')[0]).getTime();
                                        }
                                        return 0;
                                    });

                                    groupedKeys.forEach(function(keyItem) {
                                        let newFinancialItem = {
                                            lineItems: {}
                                        };
                                        let lineItems = [];
                                        let splittedItem = keyItem.split('##');
                                        newFinancialItem.startDate = splittedItem[0];
                                        newFinancialItem.endDate = splittedItem[1];
                                        _financialDataGrouped[keyItem].forEach(function(__item) {
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

                if (Array.isArray(lperData)) {
                    __lperDataMap = _.keyBy(lperData, function(item) {
                        return [_.trim(item.loanId), _.trim(item.prospectusLoanId)].join('-');
                    });
                }

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
                            }
                            if (__lperDataMap && __lperDataMap[loanForeignKey]) {
                                loanItem.loanPeriodicUpdate = [__lperDataMap[loanForeignKey]];
                            }
                        }
                        return loanItem;
                    });
                }
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
                resolve({ Investments: loanCollections });
            })
            .catch(ex => reject(ex));
    });
};
