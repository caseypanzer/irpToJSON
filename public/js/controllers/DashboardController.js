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
            $ctrl.investments = undefined;
            $.jstree.destroy();
            Upload.upload({
                url: 'api/files/upload',
                data: {loanFile: $ctrl.loanFile, serviceFile: $ctrl.serviceFile}
            }).then(function (resp) {
                toastr.success('Files Data has been parsed successfully');
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
                                                let lineItemsGroup = _.groupBy(_financial.lineItems, 'categoryCode');

                                                Object.keys(lineItemsGroup).forEach(function (lineItemGroupKey) {
                                                    var lineItemNode = {
                                                        text: lineItemGroupKey,
                                                        children: []
                                                    };

                                                    lineItemsGroup[lineItemGroupKey].forEach(function (lineItem) {

                                                        var actlineItemNode = {
                                                            text: lineItem.stmtType,
                                                            children: []
                                                        };

                                                        Object.keys(lineItem).forEach(function (lineItemKey) {
                                                            if (!Array.isArray(lineItem[lineItemKey])) {
                                                                var innerlineItemNode = {text: [lineItemKey, lineItem[lineItemKey]].join(' : '), icon: 'none'};
                                                                actlineItemNode.children.push(innerlineItemNode);
                                                            }
                                                        });
                                                        lineItemNode.children.push(actlineItemNode);
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
                    $('#investmentTreeView').jstree({
                            'core': {
                                data      : { text: 'Investments',
                                state     : { opened    : true},
                                children  : treeData}
                        }
                    });
                }
                $ctrl.sumittingFiles = false;
            }, function (resp) {
                $ctrl.sumittingFiles = false;
                toastr.error('Error status: ' + resp.status);

            }, function (evt) {

            });


        };

        $ctrl.downloadJson=function () {
            var file = new Blob([ JSON.stringify($ctrl.investments, null, 4) ], {
                type : 'application/json'
            });
            var fileURL = URL.createObjectURL(file);
            var link         = document.createElement('a');
            link.href        = fileURL;
            link.target      = '_blank';
            link.download    = 'Investments.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

    }]);

})();
