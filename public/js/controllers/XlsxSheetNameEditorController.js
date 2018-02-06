/**
 * Created by sajibsarkar on 2/6/18.
 */


(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');

    var XLSX = require('xlsx');

    var async = require('async');

    module.controller('XlsxSheetNameEditorController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants',  'params', 'ModalService', '$modalInstance', '$sce', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants, params, ModalService, $modalInstance, $sce) {


        var $ctrl = this;


        $ctrl.isProcessing = true;

        $ctrl.contextFile = params.file;
        $ctrl.sheetNameAlias = {};

        $ctrl.sheetNameOptions = _.cloneDeep(AppConstants.SHEET_NAME_OPTIONS);

        setTimeout(function () {
            $ctrl.startProcessFile();
        }, 3000);


        function Workbook() {
            if(!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }

        $ctrl.submit = function () {

            var wb = new Workbook();
            $ctrl.workbook.SheetNames.forEach(function (sheetName) {
                wb.SheetNames.push(sheetName);
                wb.Sheets[sheetName] = $ctrl.workbook.Sheets[sheetName];
            });
            let modifiedFileName = $ctrl.contextFile.name.substring(0, $ctrl.contextFile.name.lastIndexOf('.'));
            var wbout = XLSX.write(wb, { type: 'binary', bookSST:false, bookType:'xlsx'});
            let s2ab = function (s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            };
            let modifiedFile= new Blob([s2ab(wbout)], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            modifiedFile.name = modifiedFileName+'.xlsx';
            $modalInstance.close(modifiedFile);

        };

        $ctrl.handleSheetNameChanged = function (oldsheetName, newSheetName){
            if(newSheetName ){
                if($ctrl.workbook.SheetNames.findIndex(item =>item === newSheetName) > -1){
                    toastr(`${newSheetName} already exists. Please choose another name`);
                }  else {
                    let sheetIndex = $ctrl.workbook.SheetNames.findIndex(item =>item === oldsheetName);
                    if(sheetIndex > -1){
                        $ctrl.workbook.SheetNames[sheetIndex]= newSheetName;
                        $ctrl.workbook.Sheets[newSheetName] = $ctrl.workbook.Sheets[oldsheetName];
                        delete $ctrl.workbook.Sheets[oldsheetName];
                    }
                }

            }
        };

        $ctrl.startProcessFile = function () {

            var reader = new FileReader();
            reader.onload = function(e) {
                let data = e.target.result;
                let workbook = XLSX.read(data, {type: 'binary'});
                $ctrl.workbook = workbook;
                if ($ctrl.workbook && Array.isArray($ctrl.workbook.SheetNames)) {
                    $ctrl.workbook.SheetNames.forEach(function (sheetName) {
                        $ctrl.sheetNameAlias[sheetName] = sheetName;
                    });
                }
                $ctrl.isProcessing = false;
                $scope.$applyAsync();
            };
            reader.readAsBinaryString($ctrl.contextFile);
        };


    }]);

})();
