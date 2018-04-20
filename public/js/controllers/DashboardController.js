/**
 * Created by sajib sarkar on 3/31/16.
 */

(function() {
    'use strict';

    var module = angular.module('IrpToJsonViewer');
    var XLSX = require('xlsx');
    var async = require('async');
    var FileSaver = require('file-saver');
    /**
     * The product list Controller
     */
    module.controller('DashboardController', [
        '$scope',
        '$state',
        'toastr',
        'InvestmentTreeHelper',
        'AppConstants',
        'ModalService',
        'Upload',
        function($scope, $state, toastr, InvestmentTreeHelper, AppConstants, ModalService, Upload) {
            var $ctrl = this;

            window.myCtrl = $ctrl;

            $ctrl.totalNumberOfInvestment = 0;
            $ctrl.totalNumberOfAsset = 0;

            $ctrl.loanFile = [];

            $ctrl.serviceFile = [];

            $ctrl.lperFile = [];

            $ctrl.sheetNameMap = {};

            let expectedServiceTabs = _.cloneDeep(AppConstants.SHEET_NAME_OPTIONS);

            function getAvaileAbleServiceTab() {
                $ctrl.availableServiceTabs = expectedServiceTabs.reduce(function(memo, current) {
                    memo.push({
                        name: current,
                        isAvailable: false
                    });
                    return memo;
                }, []);
                return $ctrl.availableServiceTabs;
            }

            $ctrl.investments = undefined;

            getAvaileAbleServiceTab();

            $scope.$watch('$ctrl.loanFilePlaceHolder', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (newVal) {
                        if (newVal && newVal.length > 0) {
                            newVal.forEach(function(_newFile) {
                                $ctrl.loanFile.push(_newFile);
                            });
                            setTimeout(checkAndAdjustLoanFiles, 10);
                        }
                    }
                }
            });

            $scope.$watch('$ctrl.lperFilePlaceHolder', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (newVal) {
                        if (newVal && newVal.length > 0) {
                            newVal.forEach(function(_newFile) {
                                $ctrl.lperFile.push(_newFile);
                            });
                            setTimeout(checkAndAdjustLperFiles, 10);
                        }
                    }
                }
            });

            $scope.$watch('$ctrl.serviceFilePlaceHolder', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (newVal && newVal.length > 0) {
                        newVal.forEach(function(_newFile) {
                            $ctrl.serviceFile.push(_newFile);
                        });
                        setTimeout(adjustAvailableTabs, 10);
                    }
                }
            });

            function checkAndAdjustLoanFiles() {
                if ($ctrl.loanFile) {
                    async.eachSeries(
                        $ctrl.loanFile,
                        function(file, next) {
                            if (/\.txt$/i.test(file.name) || /\.csv/i.test(file.name)) {
                                ModalService.showXlsxImportEditorWizard({ file: file, isLoanFile: true }).then(
                                    function(modifiedFile) {
                                        let fIndex = $ctrl.loanFile.findIndex(_file => _file === file);
                                        $ctrl.loanFile.splice(fIndex, 1, modifiedFile);
                                        next(null, modifiedFile);
                                    },
                                    function(ex) {
                                        console.log(ex);
                                        next(null, file);
                                    }
                                );
                            } else {
                                next(null, file);
                            }
                        },
                        function(files) {
                            $scope.$applyAsync();
                        }
                    );
                }
            }

            function checkAndAdjustLperFiles() {
                if ($ctrl.lperFile) {
                    async.eachSeries(
                        $ctrl.lperFile,
                        function(file, next) {
                            if (/\.txt$/i.test(file.name) || /\.csv/i.test(file.name)) {
                                $scope.$applyAsync();
                                ModalService.showXlsxImportEditorWizard({ file: file, isLoanFile: true }).then(
                                    function(modifiedFile) {
                                        let fIndex = $ctrl.lperFile.findIndex(_file => _file === file);
                                        $ctrl.lperFile.splice(fIndex, 1, modifiedFile);
                                        next(null, modifiedFile);
                                    },
                                    function(ex) {
                                        console.log(ex);
                                        next(null, file);
                                    }
                                );
                            } else {
                                next(null, file);
                            }
                        },
                        function(files) {
                            $scope.$applyAsync();
                        }
                    );
                }
            }

            function adjustAvailableTabs() {
                let availableServiceTabs = getAvaileAbleServiceTab();
                readFileSheetName($ctrl.serviceFile);
                $scope.$applyAsync();
            }

            function readFileSheetName(files) {

                async.eachSeries(
                    files,
                    function(file, next) {
                        if (/\.txt$/i.test(file.name) || /\.csv/i.test(file.name)) {
                            ModalService.showXlsxImportEditorWizard({ file: file }).then(
                                function(modifiedFile) {
                                    let fIndex = $ctrl.serviceFile.findIndex(_file => _file === file);
                                    $ctrl.serviceFile.splice(fIndex, 1, modifiedFile);
                                    let reader = new FileReader();
                                    reader.onload = function(e) {
                                        var data = e.target.result;
                                        var workbook;
                                        try {
                                            workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                                            if (workbook && Array.isArray(workbook.SheetNames)) {
                                                workbook.SheetNames.forEach(function(sheetName) {
                                                    $ctrl.sheetNameMap[sheetName.toLowerCase()] = true;
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
                                },
                                function(ex) {
                                    console.log(ex);
                                    next(null);
                                }
                            );
                        } else if (!file.isSheetNameCheckingProcessed) {
                            let reader = new FileReader();
                            reader.onload = function(e) {
                                var data = e.target.result;
                                var workbook;
                                try {
                                    workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                                    if (workbook && Array.isArray(workbook.SheetNames)) {
                                        ModalService.showSheetNameEditorWizard({ file: file }).then(function(modifiedFile) {
                                            let fIndex = $ctrl.serviceFile.findIndex(_file => _file === file);
                                            modifiedFile.isSheetNameCheckingProcessed = true;
                                            $ctrl.serviceFile.splice(fIndex, 1, modifiedFile);
                                            let reader = new FileReader();
                                            reader.onload = function(e) {
                                                var data = e.target.result;
                                                var workbook;
                                                try {
                                                    workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                                                    if (workbook && Array.isArray(workbook.SheetNames)) {
                                                        workbook.SheetNames.forEach(function(sheetName) {
                                                            $ctrl.sheetNameMap[sheetName.toLowerCase()] = true;
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
                        } else {
                            next(null);
                        }
                    },
                    function() {
                        let sheetNameMapKeys = Object.keys($ctrl.sheetNameMap);
                        $ctrl.availableServiceTabs = $ctrl.availableServiceTabs.map(function(item) {
                            let isAvailable = sheetNameMapKeys.some(function(keyNameItem) {
                                return new RegExp(item.name + '$', 'i').test(keyNameItem);
                            });
                            if (isAvailable === true) {
                                item.isAvailable = isAvailable;
                            }

                            return item;
                        });

                        $scope.$applyAsync();
                    }
                );
            }

            $ctrl.uploadFiles1 = function() {
                let loanText, serviceText;

                $ctrl.sumittingFiles = true;
                $ctrl.investments = undefined;
                $.jstree.destroy();
                $ctrl.totalNumberOfInvestment = 0;
                $ctrl.totalNumberOfAsset = 0;
                $ctrl.errorMsgLog = undefined;
                $ctrl.showErrorMsgLog = false;

                let loanFilePromises = [];

                if (Array.isArray($ctrl.loanFile)) {
                    $ctrl.loanFile.forEach(function(__file) {
                        loanFilePromises.push(getBase64(__file));
                    });
                }

                Promise.all(loanFilePromises)
                    .then(res => {
                        loanText = res;
                        let _promises = [];
                        if (Array.isArray($ctrl.serviceFile)) {
                            $ctrl.serviceFile.forEach(function(_serviceFile) {
                                _promises.push(getBase64(_serviceFile));
                            });
                        }

                        return Promise.all(_promises);
                    })
                    .then(res => {
                        serviceText = res;
                        let lperFilePromises = [];
                        if (Array.isArray($ctrl.lperFile)) {
                            $ctrl.lperFile.forEach(function(__file) {
                                lperFilePromises.push(getBase64(__file));
                            });
                            return Promise.all(lperFilePromises);
                        } else return false;
                    })
                    .then(lperFileText => {
                        let requestParams = {
                            loanFile: loanText,
                            serviceFile: serviceText
                        };

                        if (lperFileText && lperFileText.length > 0) {
                            requestParams.lperFile = lperFileText;
                        }

                        $.ajax(AppConstants.FILE_UPLOAD_URI_LOCAL, {
                            type: 'POST',
                            dataType: 'json',
                            cache: false,
                            processData: false,
                            timeout: 9999999999,
                            contentType: 'application/json; charset=UTF-8',
                            data: JSON.stringify(requestParams),
                            success: function(resp) {
                                //console.log(resp);
                                $ctrl.investments = resp.Investments;
                                let errors =  resp.errors;
                                $ctrl.totalNumberOfInvestment = _.size(resp.Investments);
                                $ctrl.totalNumberOfAsset = 0;
                                $ctrl.treeJsonData = InvestmentTreeHelper.buildTree(resp.Investments);

                                $('#investmentTreeView').jstree({
                                    core: {
                                        data: {
                                            text: 'Investments',
                                            state: { opened: false },
                                            children: $ctrl.treeJsonData
                                        }
                                    }
                                });
                                $ctrl.sumittingFiles = false;
                                $ctrl.totalNumberOfAsset = $ctrl.investments.reduce(function (memo, current) {
                                    if(current && Array.isArray(current.properties)){
                                        memo += _.size(current.properties);
                                    }
                                    return memo;
                                }, 0);

                                if(errors && errors.length > 0){
                                    let inputArr = [];
                                    let errorGroupByType=_.groupBy(errors, 'type');
                                    _.sortBy(Object.keys(errorGroupByType)).forEach(function (keyName) {
                                        if(inputArr.length > 0){
                                            inputArr.push(` `);
                                        }
                                        inputArr.push(` Error type ${keyName} `);
                                        inputArr.push(` `);
                                        errorGroupByType[keyName].forEach(function (log) {
                                            inputArr.push(log.message);
                                        })
                                    });

                                    if(inputArr.length > 0){
                                        let errorMsgLog  = inputArr.join('\n');
                                        $ctrl.errorMsgLog = errorMsgLog;
                                    }

                                }
                                $scope.$applyAsync();
                            },
                            error: function(resp) {
                                console.log(resp);
                                toastr.error('Error : ' + resp.status);
                                $ctrl.sumittingFiles = false;
                                $scope.$applyAsync();
                            }
                        });
                    });
            };

            $ctrl.uploadFiles = function() {
                let loanText, serviceText;

                $ctrl.sumittingFiles = true;
                $ctrl.investments = undefined;
                $.jstree.destroy();
                $ctrl.totalNumberOfInvestment = 0;
                $ctrl.totalNumberOfAsset = 0;
                $ctrl.errorMsgLog = undefined;
                $ctrl.showErrorMsgLog = false;

                let requestParams = {loanFile: $ctrl.loanFile, serviceFile: $ctrl.serviceFile};

                if ($ctrl.lperFile && $ctrl.lperFile.length > 0) {
                    requestParams.lperFile = $ctrl.lperFile;
                }


                Upload.upload({
                    url: AppConstants.FILE_UPLOAD_URI_LOCAL,
                    data: requestParams
                }).then(function (resp) {
                    toastr.success('Files Data has been parsed successfully');
                    if (resp && resp.data) {
                        $ctrl.investments = resp.data.Investments;
                        if(Array.isArray($ctrl.investments)) {
                            let errors = resp.data.errors;
                            $ctrl.treeJsonData = InvestmentTreeHelper.buildTree($ctrl.investments);
                            $('#investmentTreeView').jstree({
                                core: {
                                    data: {
                                        text: 'Investments',
                                        state: { opened: false },
                                        children: $ctrl.treeJsonData
                                    }
                                }
                            });
                            $ctrl.sumittingFiles = false;
                            $ctrl.totalNumberOfInvestment = _.size($ctrl.investments);
                            $ctrl.totalNumberOfAsset = $ctrl.investments.reduce(function (memo, current) {
                                if (current && Array.isArray(current.properties)) {
                                    memo += _.size(current.properties);
                                }
                                return memo;
                            }, 0);
                            if (errors && errors.length > 0) {
                                let inputArr = [];
                                let errorGroupByType = _.groupBy(errors, 'type');
                                _.sortBy(Object.keys(errorGroupByType)).forEach(function (keyName) {
                                    if (inputArr.length > 0) {
                                        inputArr.push(` `);
                                    }
                                    inputArr.push(` Error type ${keyName} `);
                                    inputArr.push(` `);
                                    errorGroupByType[keyName].forEach(function (log) {
                                        inputArr.push(log.message);
                                    })
                                });
                                if (inputArr.length > 0) {
                                    let errorMsgLog = inputArr.join('\n');
                                    $ctrl.errorMsgLog = errorMsgLog;
                                }

                            }
                        }
                        $scope.$applyAsync();
                    }
                }, function(resp) {
                        console.log(resp);
                        toastr.error('Error : ' + resp.status);
                        $ctrl.sumittingFiles = false;
                        $scope.$applyAsync();
                });
            };

            $ctrl.downloadJson = function() {
                let data = $ctrl.investments;

                let firstInvestment = _.head($ctrl.investments);

                //InvestmentJsonFormatHelper.formatDownloadableJson($ctrl.investments);
                var file = new Blob([JSON.stringify(data, null, 4)], {
                    type: 'application/json'
                });


                let _propertyFile = $ctrl.serviceFile.find(item => /_property/i.test(item.name));
                let downloadableFileName;

                if(firstInvestment  &&  firstInvestment.transactionId){
                    downloadableFileName = firstInvestment.transactionId + '_' + Date.now() + '.json';

                } else  if (_propertyFile && _propertyFile.name) {
                    downloadableFileName = _propertyFile.name.substring(0, _propertyFile.name.lastIndexOf('.')) + '_' + Date.now() + '.json';
                }

                FileSaver.saveAs(file, downloadableFileName);
            };
        }
    ]);

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
})();
