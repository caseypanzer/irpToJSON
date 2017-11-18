/**
 * Created by sajibsarkar on 3/31/16.
 */


(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');


    /**
     * The product list Controller
     */
    module.controller('DashboardController', ['$scope', '$state', 'toastr', 'DashboardService', 'Upload', function ($scope, $state, toastr, DashboardService, Upload) {


        var $ctrl = this;

        $ctrl.investments = undefined;
        $ctrl.uploadFiles = function () {
            $ctrl.sumittingFiles = true;
            Upload.upload({
                url: 'api/files/upload',
                data: {loanFile: $ctrl.loanFile, serviceFile: $ctrl.serviceFile}
            }).then(function (resp) {
                toastr.success('Files Data has been parsed successfully');
                console.log(resp);
                if (resp && resp.data) {
                    $ctrl.investments = resp.data.Investments;


                    var treeData = [];

                    if (Array.isArray($ctrl.investments)) {

                        $ctrl.investments.forEach(function (investment, investmentIndex) {
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


                            var grandPropertiesNode = {
                                text: 'Properties',
                                children: []
                            };


                            if (Array.isArray(investment.properties)) {
                                investment.properties.forEach(function (property) {

                                    var propertiesNode = {
                                        text: property.propertyId,
                                        children: []
                                    };


                                    var grandFinancialNode = {
                                        text: 'Financials',
                                        children: []
                                    };

                                    Object.keys(property).forEach(function (propKey) {
                                        if (!Array.isArray(property[propKey])) {
                                            var propNodeItem = {text: [propKey, property[propKey]].join(' : ') , icon: 'none'};
                                            propertiesNode.children.push(propNodeItem);
                                        }
                                    });


                                    if (Array.isArray(property.financials)) {
                                        property.financials.forEach(function (_financial) {

                                            var financialNode = {
                                                text: _financial.startDate,
                                                children: []
                                            };

                                            var grandLineItemNode = {
                                                text: 'LineItems',
                                                children: []
                                            };

                                            Object.keys(_financial).forEach(function (financeKey) {
                                                if (!Array.isArray(_financial[financeKey])) {
                                                    var _financeNodeItem = {text: [financeKey, _financial[financeKey]].join(' : '), icon: 'none'};
                                                    financialNode.children.push(_financeNodeItem);
                                                }
                                            });


                                            if (Array.isArray(_financial.lineItems)) {
                                                _financial.lineItems.forEach(function (lineItem) {
                                                    var lineItemNode = {
                                                        text: lineItem.propertyId,
                                                        children: []
                                                    };

                                                    Object.keys(lineItem).forEach(function (lineItemKey) {
                                                        if (!Array.isArray(lineItem[lineItemKey])) {
                                                            var innerlineItemNode = {text: [lineItemKey, lineItem[lineItemKey]].join(' : '), icon: 'none'};
                                                            lineItemNode.children.push(innerlineItemNode);
                                                        }
                                                    });

                                                    grandLineItemNode.children.push(lineItemNode);

                                                });

                                                financialNode.children.push(grandLineItemNode);
                                            }
                                            grandFinancialNode.children.push(financialNode);

                                        });

                                    }


                                    propertiesNode.children.push(grandFinancialNode);
                                    grandPropertiesNode.children.push(propertiesNode);
                                });


                            }


                            investmentNode.children.push(grandPropertiesNode);

                            treeData.push(investmentNode);

                        });

                    }

                    //  console.log('treeData', treeData);
                    $('#investmentTreeView').jstree({
                        'core': {
                            data: treeData
                        }
                    });
                }
                $ctrl.sumittingFiles = false;
            }, function (resp) {
                $ctrl.sumittingFiles = false;
                toastr.error('Error status: ' + resp.status);

            }, function (evt) {

            });


        }

    }]);

})();
