/**
 * Created by sajibsarkar on 3/31/16.
 */


(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');
    var XLSX  = require('xlsx');
    var async = require('async');
    var FileSaver = require('file-saver');
    /**
     * The product list Controller
     */
    module.controller('DashboardController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants','ModalService', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants, ModalService) {

        var $ctrl = this;

        window.myCtrl = $ctrl;

        $ctrl.loanFile;
        $ctrl.serviceFile=[];


        let expectedServiceTabs = _.cloneDeep(AppConstants.SHEET_NAME_OPTIONS);

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


        $scope.$watch('$ctrl.loanFilePlaceHolder', function (newVal, oldVal) {
            if(newVal !==  oldVal){
              if(newVal){
                  $ctrl.loanFile = newVal;
              }
            }
        });

        $scope.$watch('$ctrl.serviceFilePlaceHolder', function (newVal, oldVal) {
            if(newVal !==  oldVal){
                if(newVal && newVal.length >  0){
                    newVal.forEach(function (_newFile) {
                        $ctrl.serviceFile.push(_newFile);
                    });
                    setTimeout(adjustAvailableTabs, 10);
                }

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

                if(/\.txt$/i.test(file.name) ||  /\.csv/i.test(file.name)){
                    ModalService.showXlsxImportEditorWizard({file:file}).then(function (modifiedFile) {
                        let fIndex = $ctrl.serviceFile.findIndex((_file => _file === file));
                        $ctrl.serviceFile.splice(fIndex, 1, modifiedFile);
                        let reader = new FileReader();
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
                        reader.readAsBinaryString(modifiedFile);
                    }, function (ex) {
                        console.log(ex);
                        next(null);
                    });
                } else {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook;
                        try {
                            workbook = XLSX.read(data, {type: 'binary'});
                            if (workbook && Array.isArray(workbook.SheetNames)) {

                                ModalService.showSheetNameEditorWizard({file:file}).then(function (modifiedFile) {
                                        let fIndex = $ctrl.serviceFile.findIndex((_file => _file === file));
                                        modifiedFile.isSheetNameCheckingProcessed = true;
                                        $ctrl.serviceFile.splice(fIndex, 1, modifiedFile);
                                        let reader = new FileReader();
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
                                                console.log(ex);
                                                next(null);
                                            }

                                        };
                                        reader.readAsBinaryString(modifiedFile);

                                    });

                            }

                        } catch (ex) {
                            console.log(ex);
                            var message = 'Failed to read the uploaded file. Please check if it contains unsupported characters or formats.';
                            toastr.error(message);
                            next(null);
                        }

                    };
                    reader.readAsBinaryString(file);
                }


            }, function () {

                let sheetNameMapKeys = Object.keys(sheetNameMap);

                $ctrl.availableServiceTabs = $ctrl.availableServiceTabs.map(function (item) {
                    let  isAvailable= sheetNameMapKeys.some(function (keyNameItem) {
                       return new RegExp(item.name+'$', 'i').test(keyNameItem)
                    });
                    if(isAvailable === true){
                        item.isAvailable = isAvailable;
                    }

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

                let _promises = [];

                if(Array.isArray($ctrl.serviceFile)){
                    $ctrl.serviceFile.forEach(function (_serviceFile) {
                        _promises.push(getBase64(_serviceFile));
                    });
                }

                return Promise.all(_promises);

            }).then((res)=> {
                serviceText  =  res;
                return  true;
            }).then(() => {

                let  requestParams =  {
                    "loanFile"  :  loanText,
                    "serviceFile": serviceText
                };

                $.ajax(AppConstants.FILE_UPLOAD_URI_LOCAL, {
                    type     : 'POST',
                    dataType : 'json',
                    cache    : false,
                    processData: false,
                    timeout  : 9999999999,
                    contentType : 'application/json; charset=UTF-8',
                    data     : JSON.stringify(requestParams),
                    success: function (resp) {
                       // console.log(resp);
                        $ctrl.investments = resp.Investments;
                        $ctrl.treeJsonData = InvestmentTreeHelper.buildTree(resp.Investments);
                        $('#investmentTreeView').jstree({
                            'core': {
                                data      : { text: 'Investments',
                                    state     : { opened    : true},
                                    children  :  $ctrl.treeJsonData
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

            let data = $ctrl.investments;

            //InvestmentJsonFormatHelper.formatDownloadableJson($ctrl.investments);
            var file = new Blob([ JSON.stringify(data, null, 4) ], {
                type : 'application/json'
            });

            FileSaver.saveAs(file);
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
