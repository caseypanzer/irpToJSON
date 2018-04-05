/**
 * Created by sajibsarkar on 2/6/18.
 */

(function() {
    'use strict';

    var module = angular.module('IrpToJsonViewer');

    var XLSX = require('xlsx');

    var async = require('async');

    module.controller('XlsxSheetNameEditorController', [
        '$scope',
        '$state',
        'toastr',
        'InvestmentTreeHelper',
        'AppConstants',
        'params',
        'ModalService',
        '$modalInstance',
        '$sce',
        function($scope, $state, toastr, InvestmentTreeHelper, AppConstants, params, ModalService, $modalInstance, $sce) {
            var $ctrl = this;

            $ctrl.isProcessing = true;

            $ctrl.contextFile = params.file;
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
                $ctrl.isProcessing = true;

                var wb = new Workbook();
                $ctrl.workbook.SheetNames.forEach(function(sheetName) {
                    wb.SheetNames.push(sheetName);
                    wb.Sheets[sheetName] = $ctrl.workbook.Sheets[sheetName];
                });
                let modifiedFileName = $ctrl.contextFile.name.substring(0, $ctrl.contextFile.name.lastIndexOf('.'));
                var wbout = XLSX.write(wb, { cellDates: true, type: 'binary', bookSST: false, bookType: 'xlsx' });
                let s2ab = function(s) {
                    var buf = new ArrayBuffer(s.length);
                    var view = new Uint8Array(buf);
                    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
                    return buf;
                };
                let modifiedFile = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                modifiedFile.name = modifiedFileName + '.xlsx';
                $ctrl.isProcessing = false;
                $modalInstance.close(modifiedFile);
            };

            $ctrl.handleSheetNameChanged = function(oldsheetName, newSheetName) {
                if (newSheetName) {
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
            };

            $ctrl.startProcessFile = function() {
                var reader = new FileReader();
                reader.onload = function(e) {
                    let data = e.target.result;
                    let workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                    $ctrl.workbook = workbook;
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

                       /* if(!$ctrl.workbook.SheetNames.find(_name => _.lowerCase(_name) === 'rpttotalloan')){
                            let tlrTabNameIndex = $ctrl.workbook.SheetNames.findIndex(_name => _.lowerCase(_name) === 'tlr');
                            if (tlrTabNameIndex > -1) {
                                let oldsheetName = $ctrl.workbook.SheetNames[tlrTabNameIndex];
                                $ctrl.workbook.Sheets['rpttotalloan'] = $ctrl.workbook.Sheets[oldsheetName];
                                $ctrl.workbook.SheetNames[tlrTabNameIndex] = 'rpttotalloan';
                                delete $ctrl.workbook.Sheets[oldsheetName];
                                $ctrl.sheetNameAlias['rpttotalloan'] = 'rpttotalloan';
                            }
                        }*/

                    }


                    $ctrl.isProcessing = false;
                    $scope.$applyAsync();
                };
                reader.readAsBinaryString($ctrl.contextFile);
            };
        }
    ]);
})();
