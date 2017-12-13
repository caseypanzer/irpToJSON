/**
 * Created by sajibsarkar on 3/31/16.
 */


(function () {
    'use strict';



    var module = angular.module('IrpToJsonViewer');

        var XLSX = require('XLSX');
        var async = require('async');
    /**
     * The product list Controller
     */
    module.controller('DashboardController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants) {

        var $ctrl = this;

        let expectedServiceTabs = [
            '_property',
            '_financial',
            'tCComparativeFinancialStatusIRP',
            'rptDDelinquentLoanStatus',
            'rptMHistoricalLoanMod',
            'rptRsvLOC',
            'rptREOStatus',
            'rptWServicerWatchlistIRP',
            'TLR',
            'rptAdvRecovery'
        ];


        function getAvaileAbleServiceTab() {
            $ctrl.availableServiceTabs = expectedServiceTabs.reduce(function (memo, current) {
                  memo.push({
                    name: current,
                    isAvailable : false
                });
                return  memo;
            },[]);

            return  $ctrl.availableServiceTabs;
        }


        $ctrl.investments = undefined;

        getAvaileAbleServiceTab();

        $scope.$watch('$ctrl.serviceFile', function (newVal, oldVal) {
            if(newVal !==  oldVal){
                setTimeout(adjustAvailableTabs, 10)
            }
        });


        function adjustAvailableTabs() {
            let availableServiceTabs = getAvaileAbleServiceTab();
            readFileSheetName($ctrl.serviceFile);
            $scope.$applyAsync();
        }




        function readFileSheetName(files) {


            let sheetNameMap = {};
            async.eachSeries(files,  function (file, next) {

                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook;
                    try {
                        workbook = XLSX.read(data, {type: 'binary'});
                        if (workbook && Array.isArray(workbook.SheetNames)) {
                            workbook.SheetNames.forEach(function (sheetName) {
                                sheetNameMap[sheetName.toLowerCase()] = true;
                            });
                        }
                        next(null);

                    } catch (ex) {
                        var message = 'Failed to read the uploaded file. Please check if it contains unsupported characters or formats.';
                        console.log(message);
                        next(null);
                    }

                };

                reader.readAsBinaryString(file);

            }, function () {

                $ctrl.availableServiceTabs = $ctrl.availableServiceTabs.map(function (item) {
                    item.isAvailable = sheetNameMap[item.name.toLowerCase()] === true;
                    return item;
                });

                $scope.$applyAsync();
            });

        }

        $ctrl.uploadFiles = function () {

            let  loanText,  serviceText;

            $ctrl.sumittingFiles = true;
            $ctrl.investments = undefined;
            $.jstree.destroy();

            getBase64($ctrl.loanFile).then(res => {
                loanText  =  res;
                return  getBase64(_.head($ctrl.serviceFile));
            }).then((res)=> {
                serviceText  =  res;
                return  true;
            }).then(() => {

                let  requestParams =  {
                    "loanFile"  :  loanText,
                    "serviceFile": serviceText
                };

                $.ajax(AppConstants.FILE_UPLOAD_URI, {
                    type     : 'POST',
                    dataType : 'json',
                    cache    : false,
                    processData: false,
                    timeout  : 9999999999,
                    //contentType : 'application/json; charset=UTF-8',
                    data     : JSON.stringify(requestParams),
                    success: function (resp) {
                       // console.log(resp);
                        $ctrl.investments = resp.Investments;
                        $('#investmentTreeView').jstree({
                            'core': {
                                data      : { text: 'Investments',
                                    state     : { opened    : true},
                                    children  : InvestmentTreeHelper.buildTree(resp.Investments)
                                }
                            }
                        });
                        $ctrl.sumittingFiles = false;
                        $scope.$applyAsync();

                    }, error: function (resp) {
                        console.log(resp);
                        toastr.error('Error : ' + resp.status);
                        $ctrl.sumittingFiles = false;
                        $scope.$applyAsync();
                    }});
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


    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
})();
