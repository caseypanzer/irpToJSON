/**
 * Created by sajibsarkar on 12/19/17.
 */



(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');

    var XLSX = require('XLSX');

    var async = require('async');

    /**
     * The product list Controller
     */
    module.controller('XlsxImportEditorController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants',  'params', 'ModalService', '$modalInstance', '$sce', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants, params, ModalService, $modalInstance, $sce) {


                var $ctrl = this;


                $ctrl.isProcessing = true;

                $ctrl.contextFile = params.file;

                $ctrl.sheetNameOptions = [
                    "_property",
                    "_financial",
                    'tccomparativefinancialstatusirp',
                    'rptddelinquentloanstatus'  ,
                    'rptmhistoricalloanmod',
                    'rptrsvloc',
                    'rptreostatus',
                    'rptwservicerwatchlistirp',
                    'rptadvrecovery'
                ];

                setTimeout(function () {
                    $ctrl.startProcessFile();
                }, 3000);


                function Workbook() {
                    if(!(this instanceof Workbook)) return new Workbook();
                    this.SheetNames = [];
                    this.Sheets = {};
                }


                $ctrl.submit = function () {

                    if(Array.isArray($ctrl.htmlTables)){
                       let inValidSheetName = $ctrl.htmlTables.find(function (sheetName) {
                            return typeof sheetName === 'undefined' || (sheetName  === 'Sheet1') || (sheetName  === null) || sheetName === '';
                        });

                       if(inValidSheetName){
                           return toastr.error('Not a valid sheet name. Please choose appropriate sheet name.')
                       }


                        var wb = new Workbook();

                        $ctrl.htmlTables.forEach(function (table) {

                                let htmlFrag  = table._html.valueOf();

                                let ws = XLSX.utils.table_to_sheet($(htmlFrag)[0]);
                           // let ws = XLSX.utils.aoa_to_sheet([table.rows]);
                            wb.SheetNames.push(table.sheetName);
                            wb.Sheets[table.sheetName] = ws;
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

                       /*
                       let modifiedFile = new File(fileBlob, modifiedFileName+'.xlsx', {
                           type : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                       });
                       */

//modifiedFileName+'.xlsx'


                       /*
                            var o = XLSX.write(wb, { bookType:'html', type: 'binary', editable:true});
                            sheetName : sheetName,
                            rows      :  XLSX.utils.sheet_to_row_object_array(wb["Sheets"][sheetName])
                        });



                        */
                    }

                };


                $ctrl.startProcessFile = function () {

                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var data = e.target.result;
                        function doitnow() {
                            try {
                                xw(data, process_wb);
                            } catch(e) {
                                console.log(e);
                               /* alertify.alert('We unfortunately dropped the ball here.  Please test the file using the <a href="/js-xlsx/">raw parser</a>.  If there are issues with the file processor, please send this file to <a href="mailto:dev@sheetjs.com?subject=I+broke+your+stuff">dev@sheetjs.com</a> so we can make things right.', function(){});*/

                            }
                        }
                        /*if(e.target.result.length > 1e6) alertify.confirm("This file is " + e.target.result.length + " bytes and may take a few moments.  Your browser may lock up during this process.  Shall we play?", function(k) { if(k) doitnow(); });*/


                         doitnow();
                    };
                    reader.readAsBinaryString($ctrl.contextFile);
                };


        function xw(data, cb) {

            try {
               let workbook = XLSX.read(data, {type: 'binary'});
                cb(workbook);
            } catch (ex) {
                var message = 'Failed to read the uploaded file. Please check if it contains unsupported characters or formats.';
                console.log(ex);
                cb(null);
            }

        }

        function fixdata(data) {
            var o = "", l = 0, w = 10240;
            for(; l < data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
            o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
            return o;
        }
        function process_wb(wb) {


            if(wb){
               // console.log('wb', XLSX.utils.sheet_to_row_object_array(wb));
                $ctrl.workbook = wb;
                $ctrl.htmlTables = [];
                wb.SheetNames.forEach(function(sheetName) {
                    //console.log('data', XLSX.utils.aoa_to_sheet(wb["Sheets"][sheetName]));
                    let  _htmlStr = XLSX.write(wb, { sheetName : sheetName, bookType:'html', type: 'binary', editable:true});
                    _htmlStr = _htmlStr.replace('<html><body>', '');
                    _htmlStr = _htmlStr.replace('</html></body>', '');
                    $ctrl.htmlTables.push({
                        sheetName : sheetName,
                        _html     :  $sce.trustAsHtml(_htmlStr),
                    });
                });


                //rows      :  XLSX.utils.sheet_to_row_object_array(wb["Sheets"][sheetName])
               // var o = XLSX.write(wb, { bookType:'html', type: 'binary', editable:true});
               // document.getElementById('excel-table').outerHTML = o;

                $ctrl.isProcessing = false;
                $scope.$applyAsync();
            }

           // XLSX.utils.sheet_to_row_object_array
            //spinner.stop();

        }


    }]);

})();
