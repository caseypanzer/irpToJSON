import { Injectable } from '@angular/core';
import * as _ from 'lodash';

const otherPropertyKeys = [
  'tccomparativefinancialstatusirp',
  'rptddelinquentloanstatus',
  'rptmhistoricalloanmod',
  'rptrsvloc',
  // 'rptreostatus',
  'rptwservicerwatchlistirp',
  'rpttotalloan',
  'rptadvrecovery'
];


@Injectable()
export class InvestmentTreeHelperService {

  constructor() {}

  buildTree(data: any[]) {
    const treeData = [];
    for (const investment of data) {
      const investmentNode = _prepareInvestmentNode(
        investment
      );
      treeData.push(investmentNode);
    }
    return treeData;
  }
}

    /***
 * Private methods
 */

function _prepareLineItemNode(_financial) {

  const grandLineItemNode = {
    name: 'LineItems',
    children: []
  };

  const  lineItemKeys = Object.keys(_financial.lineItems);

  for (const stmtTypeKey of lineItemKeys) {

    const lineItemNode = {
      name      : stmtTypeKey,
      children  : []
    };


    const lineItemsByCategoryCode = _.groupBy(_financial.lineItems[stmtTypeKey], 'categoryCode');


    _.sortBy(Object.keys(lineItemsByCategoryCode)).forEach(function (catKey) {
      const lineItemCatNode = {
        name      : catKey,
        children  : []
      };

      _.forEach(lineItemsByCategoryCode[catKey], function (nodeItem) {
        Object.keys(nodeItem).forEach(function(dataKey) {
          if (!Array.isArray(nodeItem[dataKey])) {
            const _nodeItem = {
              name: [dataKey, nodeItem[dataKey]].join(
                ' : '
              ),
              icon: 'none'
            };
            lineItemCatNode.children.push(_nodeItem);
          }
        });

      });
      lineItemNode.children.push(lineItemCatNode);

    });


    grandLineItemNode.children.push(lineItemNode);
  }

  return grandLineItemNode;
}

function _prepareFinancialNodes(property) {
  const grandFinancialNode = {
    name: 'Financials',
    children: []
  };

  if (Array.isArray(property.financials)) {
    property.financials.map(function(_financial) {
      if (_financial.startDate) {
        _financial.startDate = new Date(_financial.startDate);
      }
      if (_financial.endDate) {
        _financial.endDate = new Date(_financial.endDate);
      }
      const financialNode = {
        name: _financial.startDate,
        children: []
      };
      Object.keys(_financial).forEach(function(financeKey) {
        if (financeKey !== 'lineItems' && !Array.isArray(_financial[financeKey])) {
          const _financeNodeItem = {
            name: [financeKey, _financial[financeKey]].join(
              ' : '
            ),
            icon: 'none'
          };
          financialNode.children.push(_financeNodeItem);
        }
      });
      const grandLineItemNode = _prepareLineItemNode(_financial);
      financialNode.children.push(grandLineItemNode);
      grandFinancialNode.children.push(financialNode);
    });
  }

  return grandFinancialNode;
}

function _preparePropertiesNode(investment) {
  const grandPropertiesNode = {
    name: 'Properties',
    children: []
  };

  if (Array.isArray(investment.properties)) {
    investment.properties.forEach(function(property) {
      const propertiesNode = {
        name: property.propertyId,
        children: []
      };

      Object.keys(property).forEach(function(propKey) {
        if (!Array.isArray(property[propKey])) {
          const propNodeItem = {
            name: [propKey, property[propKey]].join(' : '),
            icon: 'none'
          };
          propertiesNode.children.push(propNodeItem);
        }
      });

      const grandRptreostatusNode = {
        name: 'rptreostatus',
        children: []
      };
      if (Array.isArray(property.rptreostatus)) {
        const rptreostatusByDates = _.groupBy(
          property.rptreostatus,
          function(item) {
            return new Date(item.startDate).toDateString();
          }
        );
        Object.keys(rptreostatusByDates).forEach(function(
          __keyName
        ) {
          const rptreostatusNode = {
            name: __keyName,
            children: []
          };
          rptreostatusByDates[__keyName].forEach(function(
            dataItem
          ) {
            Object.keys(dataItem).forEach(function(dataKey) {
              if (!Array.isArray(dataItem[dataKey])) {
                const _nodeItem = {
                  name: [dataKey, dataItem[dataKey]].join(
                    ' : '
                  ),
                  icon: 'none'
                };
                rptreostatusNode.children.push(_nodeItem);
              }
            });
          });
          grandRptreostatusNode.children.push(rptreostatusNode);
        });
      }
      const grandFinancialNode = _prepareFinancialNodes(property);
      propertiesNode.children.push(grandFinancialNode);
      grandPropertiesNode.children.push(propertiesNode);
      if (grandRptreostatusNode.children.length > 0) {
        propertiesNode.children.push(grandRptreostatusNode);
      }
    });
  }
  return grandPropertiesNode;
}

function _preparePeriodeicUpdateNode(investment) {

  const grandPeriodicNode = {
    name: 'loanPeriodicUpdate',
    children: []
  };

  if (Array.isArray(investment.loanPeriodicUpdate)) {

    investment.loanPeriodicUpdate.forEach(function(periodicUpdateData) {
      const periodicNode = {
        name: periodicUpdateData.paidThroughDate,
        children: []
      };

      Object.keys(periodicUpdateData).forEach(function(propKey) {
        if (!Array.isArray(periodicUpdateData[propKey])) {
          const propNodeItem = {
            name: [propKey, periodicUpdateData[propKey]].join(' : '),
            icon: 'none'
          };
          periodicNode.children.push(propNodeItem);
        }
      });
      grandPeriodicNode.children.push(periodicNode);
    });
  }
  return grandPeriodicNode;

}


function _prepareLoanSetUpNode(investment) {

  const grandLoanSetupNode = {
    name: 'loanSetUp',
    children: []
  };

  if (Array.isArray(investment.loanSetUp)) {

    investment.loanSetUp.forEach(function(loanSetupData) {
      const loanSetupNode = {
        name: loanSetupData.prospectusLoanId,
        children: []
      };

      Object.keys(loanSetupData).forEach(function(propKey) {
        if (!Array.isArray(loanSetupData[propKey])) {
          const loanSetupNodeItem = {
            name: [propKey, loanSetupData[propKey]].join(' : '),
            icon: 'none'
          };
          loanSetupNode.children.push(loanSetupNodeItem);
        }
      });
      grandLoanSetupNode.children.push(loanSetupNode);
    });
  }
  return grandLoanSetupNode;

}

function _prepareOtherPropertyNode(investment, __otherPropertyKeys) {
  const _otherGrandNodes = [];

  let uniqDates = [];

  __otherPropertyKeys.forEach(function(_otherPropertyKey) {
    if (
      Array.isArray(investment[_otherPropertyKey]) &&
      investment[_otherPropertyKey].length > 0
    ) {
      investment[_otherPropertyKey] = investment[
        _otherPropertyKey
        ].map(function(item) {
        if (item.startDate) {
          item.startDate = new Date(
            item.startDate
          ).toDateString();
          if (uniqDates.indexOf(item.startDate) === -1) {
            uniqDates.push(item.startDate);
          }
        }
        return item;
      });
    }
  });

  uniqDates = _.sortBy(uniqDates, item => new Date(item));
  uniqDates.forEach(function(_dtStr) {
    const dateNode = {
      name: _dtStr,
      children: []
    };

    __otherPropertyKeys.forEach(function(_otherPropertyKey) {
      const otherPropertyNode = {
        name: _otherPropertyKey,
        children: []
      };

      if (
        Array.isArray(investment[_otherPropertyKey]) &&
        investment[_otherPropertyKey].length > 0
      ) {
        const otherDataByDateAndPropertyKey = investment[
          _otherPropertyKey
          ].filter(data => data.startDate && data.startDate === _dtStr);

        let otherPropertyGroupedData;
        let otherPropertyGroupedKey;

        switch (_otherPropertyKey) {
          case 'tccomparativefinancialstatusirp':
            otherPropertyGroupedKey = 'propertyId';
            break;
          case 'rptrsvloc':
            otherPropertyGroupedKey = 'reserveAccountType';
            break;
          case 'rptwservicerwatchlistirp':
            otherPropertyGroupedKey = 'triggerCodes';
            break;
          case 'rptddelinquentloanstatus':
            otherPropertyGroupedKey = 'paidThroughDate';
            break;
          case 'tccomparativefinancialstatusirp':
            otherPropertyGroupedKey = 'prospectusId';
            break;
          case 'rpttotalloan':
            otherPropertyGroupedKey = 'paidThruDate';
            break;
        }

        if (otherPropertyGroupedKey) {
          otherPropertyGroupedData = _.groupBy(
            otherDataByDateAndPropertyKey,
            otherPropertyGroupedKey
          );

          Object.keys(otherPropertyGroupedData).forEach(function(
            otherPropertyGroupedKeyName
          ) {
            const _groupedNode = {
              name: otherPropertyGroupedKeyName,
              children: []
            };
            otherPropertyGroupedData[
              otherPropertyGroupedKeyName
              ].forEach(function(dataItem) {
              Object.keys(dataItem).forEach(function(
                propKey
              ) {
                if (!Array.isArray(dataItem[propKey])) {
                  const dataNode = {
                    name: [
                      propKey,
                      dataItem[propKey]
                    ].join(' : '),
                    icon: 'none'
                  };
                  _groupedNode.children.push(dataNode);
                }
              });
            });
            otherPropertyNode.children.push(_groupedNode);
          });
        } else {
          otherDataByDateAndPropertyKey.forEach(function(
            dataItem
          ) {
            Object.keys(dataItem).forEach(function(propKey) {
              if (!Array.isArray(dataItem[propKey])) {
                const dataNode = {
                  name: [propKey, dataItem[propKey]].join(
                    ' : '
                  ),
                  icon: 'none'
                };
                otherPropertyNode.children.push(dataNode);
              }
            });
          });
        }
      }
      dateNode.children.push(otherPropertyNode);
    });
    _otherGrandNodes.push(dateNode);
  });
  return _otherGrandNodes;
}

function _prepareInvestmentNode(investment) {
  const investmentNode = {
    name: investment.loanId,
    children: []
  };

  Object.keys(investment).forEach(function(key) {
    if (!Array.isArray(investment[key])) {
      const nodeItem = {
        name: [key, investment[key]].join(' : '),
        icon: 'none'
      };
      investmentNode.children.push(nodeItem);
    }
  });

  const  grandLoanSetupNode =  _prepareLoanSetUpNode(investment);

  const grandPeriodicUpdateNode = _preparePeriodeicUpdateNode(investment);

  const grandPropertiesNode = _preparePropertiesNode(investment);

  investmentNode.children.push(grandLoanSetupNode);

  investmentNode.children.push(grandPeriodicUpdateNode);

  investmentNode.children.push(grandPropertiesNode);

  const _otherPropertyNode = _prepareOtherPropertyNode(
    investment,
    otherPropertyKeys
  );
  if (Array.isArray(_otherPropertyNode)) {
    _otherPropertyNode.forEach(function(_node) {
      investmentNode.children.push(_node);
    });
  }

  return investmentNode;
}




