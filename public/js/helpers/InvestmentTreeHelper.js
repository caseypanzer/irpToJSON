/**
 * Created by sajibsarkar on 11/26/17.
 */


(function () {
    'use strict';

    let module = angular.module('IrpToJsonViewer');

    let otherPropertyKeys = ['tccomparativefinancialstatusirp',
        'rptddelinquentloanstatus',
        'rptmhistoricalloanmod',
        'rptrsvloc',
        'rptreostatus',
        'rptwservicerwatchlistirp',
        'tlr',
        'rptadvrecovery'];


    console.log('otherPropertyKeys', otherPropertyKeys);
    module.factory('InvestmentTreeHelper', [function () {
        return {
            buildTree:  function (data) {
                let treeData = [];
                if (Array.isArray(data)) {
                    data.forEach(function (investment) {
                        let investmentNode = _prepareInvestmentNode(investment);
                        treeData.push(investmentNode);
                    });
                }
                return treeData;
            }
        }
    }]);

    /***
     * Private methods
     */
    function _prepareChildrenNode (data, params){

        let  propertyName = params.propertyName;
        let  nodeName = params.nodeName || propertyName;
        let grandNode = {
            text: nodeName,
            children: []
        };

        if (Array.isArray(data)) {
            let dataGroupedByProperty = _.groupBy(data, propertyName);
            Object.keys(dataGroupedByProperty).forEach(function (keyName) {
                let dataItemNode = {
                    text     : keyName,
                    children : [],
                    icon     : 'none'
                };
                dataGroupedByProperty[keyName].forEach(function (dataItem) {
                    for (let  key in  dataItem){
                        let activeItemNode = {
                            text: [key, dataItem[key]].join(' : '),
                            icon: 'none',
                            children: []
                        };
                        dataItemNode.children.push(activeItemNode);
                    }
                });
                grandNode.children.push(dataItemNode);
            });
        }
        return grandNode;
    }

    function _prepareLineItemNode(_financial) {

        let grandLineItemNode = {
            text: 'LineItems',
            children: []
        };
        if (Array.isArray(_financial.lineItems)) {
            let lineItemsGroup = _.groupBy(_financial.lineItems, 'categoryCode');
            Object.keys(lineItemsGroup).forEach(function (lineItemGroupKey) {
                let lineItemNode = _prepareChildrenNode(lineItemsGroup[lineItemGroupKey],
                    { nodeName : lineItemGroupKey,
                    propertyName  : 'stmtType' });
                grandLineItemNode.children.push(lineItemNode);
            });
        }
        return grandLineItemNode;
    }

    function _prepareFinancialNodes(property) {

        let grandFinancialNode = {
            text: 'Financials',
            children: []
        };

        if (Array.isArray(property.financials)) {
            property.financials.forEach(function (_financial) {
                let financialNode = {
                    text: _financial.startDate,
                    children: []
                };
                Object.keys(_financial).forEach(function (financeKey) {
                    if (!Array.isArray(_financial[financeKey])) {
                        var _financeNodeItem = {text: [financeKey, _financial[financeKey]].join(' : '), icon: 'none'};
                        financialNode.children.push(_financeNodeItem);
                    }
                });
                let grandLineItemNode = _prepareLineItemNode(_financial);
                financialNode.children.push(grandLineItemNode);
                grandFinancialNode.children.push(financialNode);
            });
        }

        return grandFinancialNode;
    }

    function _preparePropertiesNode(investment) {

        let grandPropertiesNode = {
            text: 'Properties',
            children: []
        };

        if (Array.isArray(investment.properties)) {

           // console.log('investment.properties',investment.loanId, investment.properties.length);
            investment.properties.forEach(function (property) {
                let propertiesNode = {
                    text: property.propertyId,
                    children: []
                };

                  Object.keys(property).forEach(function (propKey) {
                    if (!Array.isArray(property[propKey])) {
                        let propNodeItem = {text: [propKey, property[propKey]].join(' : '), icon: 'none'};
                        propertiesNode.children.push(propNodeItem);
                    }
                });

                let grandRptreostatusNode = {
                    text: 'rptreostatus',
                    children: []
                };
                if(Array.isArray(property.rptreostatus)){
                    console.log('property.rptreostatus', property.rptreostatus);
                    let rptreostatusByDates = _.groupBy(property.rptreostatus, function (item) {
                        return new Date(item.startDate).toDateString();
                    });
                    Object.keys(rptreostatusByDates).forEach(function (__keyName) {
                        let rptreostatusNode = {
                            text: __keyName,
                            children: []
                        };
                        rptreostatusByDates[__keyName].forEach(function (dataItem) {
                            Object.keys(dataItem).forEach(function (dataKey) {
                                if (!Array.isArray(dataItem[dataKey])) {
                                    var _nodeItem = {text: [dataKey, dataItem[dataKey]].join(' : '), icon: 'none'};
                                    rptreostatusNode.children.push(_nodeItem);
                                }
                            });
                        });
                        grandRptreostatusNode.children.push(rptreostatusNode);
                    });
                }
                let grandFinancialNode = _prepareFinancialNodes(property);
                propertiesNode.children.push(grandFinancialNode);
                grandPropertiesNode.children.push(propertiesNode);
                propertiesNode.children.push(grandRptreostatusNode);
            });
        }
        return grandPropertiesNode;
    }

    function _prepareOtherPropertyNode(investment, otherPropertyKeys) {

        debugger;
        let _otherGrandNodes =[];

        /*{
            text: '',
            children: []
        };*/

        let  uniqDates = [];

        otherPropertyKeys.forEach(function (_otherPropertyKey) {
            if(investment[_otherPropertyKey].length >  0){
                investment[_otherPropertyKey] = investment[_otherPropertyKey].map(function (item) {
                    if (item.startDate){
                        item.startDate = new Date(item.startDate);
                        let dtString  = item.startDate.toDateString();
                        if(uniqDates.indexOf(dtString) === -1){
                            uniqDates.push(dtString);
                        }
                    }
                    return item;
                });

            }
        });

        uniqDates = _.sortBy(uniqDates, item => new  Date(item));
        uniqDates.forEach(function (_dtStr) {
            let dateNode = {
                text: _dtStr,
                children: []
            };

            otherPropertyKeys.forEach(function (_otherPropertyKey) {

                let otherPropertyNode = {
                    text: _otherPropertyKey,
                    children: []
                };


                if(Array.isArray(investment[_otherPropertyKey]) && investment[_otherPropertyKey].length > 0){
                    let otherDataByDateAndPropertyKey = investment[_otherPropertyKey].filter(function (data) {
                       return data.startDate && data.startDate.toDateString() ===  _dtStr;
                    });

                    otherDataByDateAndPropertyKey.forEach(function (dataItem) {
                        Object.keys(dataItem).forEach(function (propKey) {
                            if (!Array.isArray(dataItem[propKey])) {
                                let dataNode = {text: [propKey, dataItem[propKey]].join(' : '), icon: 'none'};
                                //console.log(investment.loanId, dataNode);
                                otherPropertyNode.children.push(dataNode);
                            }
                        });
                    });
                }
                dateNode.children.push(otherPropertyNode);
            });
            _otherGrandNodes.push(dateNode);
        });
        return  _otherGrandNodes;
    }

    function _prepareInvestmentNode(investment) {

        let investmentNode = {
            text: investment.loanId,
            children: []
        };

        Object.keys(investment).forEach(function (key) {
            if (!Array.isArray(investment[key])) {
                var nodeItem = {text: [key, investment[key]].join(' : '), icon: 'none'};
                investmentNode.children.push(nodeItem);
            }
        });

        let grandPropertiesNode = _preparePropertiesNode(investment);
        investmentNode.children.push(grandPropertiesNode);
        let _otherPropertyNode = _prepareOtherPropertyNode(investment, otherPropertyKeys);
        if(Array.isArray(_otherPropertyNode)){
            _otherPropertyNode.forEach(function (_node) {
                investmentNode.children.push(_node);
            })
        }

        return investmentNode;
    }
})();
