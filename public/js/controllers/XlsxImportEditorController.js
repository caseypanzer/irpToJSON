/**
 * Created by sajibsarkar on 12/19/17.
 */

(function() {
    'use strict';

    var module = angular.module('IrpToJsonViewer');

    var XLSX = require('xlsx');

    var cheerio = require('cheerio');

    var async = require('async');

    module.controller('XlsxImportEditorController', [
        '$scope',
        '$state',
        'toastr',
        'InvestmentTreeHelper',
        'AppConstants',
        'params',
        'ModalService',
        '$modalInstance',
        '$sce',
        function(
            $scope,
            $state,
            toastr,
            InvestmentTreeHelper,
            AppConstants,
            params,
            ModalService,
            $modalInstance,
            $sce
        ) {
            var $ctrl = this;

            $ctrl.isProcessing = true;

            $ctrl.contextFile = params.file;
            $ctrl.isLoanFile = params.isLoanFile;
            $ctrl.sheetNameAlias = {};
            $ctrl.sheetNameOptions = _.cloneDeep(AppConstants.SHEET_NAME_OPTIONS);

            setTimeout(function() {
                $ctrl.startProcessFile();
            }, 3000);

            function Workbook() {
                if (!(this instanceof Workbook)) return new Workbook();
                this.SheetNames = [];
                this.Sheets = {};
            }

            $ctrl.submit = function() {
                if (Array.isArray($ctrl.htmlTables)) {
                    let inValidSheetName = $ctrl.htmlTables.find(function(sheetName) {
                        return (
                            typeof sheetName === 'undefined' ||
                            sheetName === 'Sheet1' ||
                            sheetName === null ||
                            sheetName === ''
                        );
                    });

                    if (inValidSheetName) {
                        return toastr.error('Not a valid sheet name. Please choose appropriate sheet name.');
                    }

                    var wb = new Workbook();
                    $ctrl.workbook.SheetNames.forEach(function(sheetName) {
                        wb.SheetNames.push(sheetName);
                        wb.Sheets[sheetName] = $ctrl.workbook.Sheets[sheetName];
                    });

                    var wbout = XLSX.write(wb, { type: 'binary', bookSST: false, bookType: 'xlsx' });
                    let s2ab = function(s) {
                        var buf = new ArrayBuffer(s.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
                        return buf;
                    };
                    let modifiedFileName = $ctrl.contextFile.name.substring(0, $ctrl.contextFile.name.lastIndexOf('.'));

                    let modifiedFile = new Blob([s2ab(wbout)], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });

                    modifiedFile.name = modifiedFileName + '.xlsx';
                    $modalInstance.close(modifiedFile);
                }
            };

            $ctrl.handleSheetNameChanged = function(oldsheetName, newSheetName) {
                if (newSheetName) {
                    if ($ctrl.workbook) {
                        if ($ctrl.workbook.SheetNames.findIndex(item => item === newSheetName) > -1) {
                            toastr(`${newSheetName} already exists. Please choose another name`);
                        } else {
                            let sheetIndex = $ctrl.workbook.SheetNames.findIndex(item => item === oldsheetName);
                            if (sheetIndex > -1) {
                                $ctrl.workbook.SheetNames[sheetIndex] = newSheetName;
                                $ctrl.workbook.Sheets[newSheetName] = $ctrl.workbook.Sheets[oldsheetName];
                                delete $ctrl.workbook.Sheets[oldsheetName];
                            }
                        }
                    }
                }
            };
            $ctrl.startProcessFile = function() {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var data = e.target.result;
                    function doitnow() {
                        try {
                            xw(data, process_wb);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    doitnow();
                };
                reader.readAsBinaryString($ctrl.contextFile);
            };

            function xw(data, cb) {
                try {
                    let workbook = XLSX.read(data, { type: 'binary' });
                    cb(workbook);
                } catch (ex) {
                    var message =
                        'Failed to read the uploaded file. Please check if it contains unsupported characters or formats.';
                    console.log(ex);
                    cb(null);
                }
            }

            function fixdata(data) {
                var o = '',
                    l = 0,
                    w = 10240;
                for (; l < data.byteLength / w; ++l)
                    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
                o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
                return o;
            }
            function process_wb(wb) {
                if (wb) {
                    $ctrl.workbook = wb;
                    $ctrl.htmlTables = [];

                    if ($ctrl.workbook && Array.isArray($ctrl.workbook.SheetNames)) {
                        $ctrl.workbook.SheetNames.forEach(function(sheetName) {
                            if (new RegExp('_property', 'i').test(sheetName)) {
                                $ctrl.sheetNameAlias[sheetName] = '_property';
                            } else if (new RegExp('_financial', 'i').test(sheetName)) {
                                $ctrl.sheetNameAlias[sheetName] = '_financial';
                            } else {
                                $ctrl.sheetNameAlias[sheetName] = sheetName.toLowerCase();
                            }
                        });
                    }
                    $ctrl.isProcessing = false;
                    if ($ctrl.isLoanFile === true) {
                         $ctrl.submit();
                    } else {
                        $scope.$applyAsync();
                    }
                }
            }
        }
    ]);
})();
