'use strict'; /**
               * Created by sajibsarkar on 3/30/16.
               */

(function () {

    'use strict';

    var module = angular.module("IrpToJsonViewer", ['ui.router', 'ui.bootstrap', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ngResource', 'toastr', 'ngSanitize', 'ngFileUpload']);


    require('bootstrap/dist/css/bootstrap.min.css');
    require('angular-toastr/dist/angular-toastr.css');
    require('ionicons/dist/css/ionicons.css');
    require('../styles.css');

    module.component('tinySpinner', {
        template: ['<div class="tiny-spinner">',
        '<div class="bounce1"></div>',
        '<div class="bounce2"></div>',
        '<div class="bounce3"></div></div>'].join('') });

    /**
                                                           * Router config
                                                           */
    module.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
        $stateProvider.
        state('dashboard', {
            url: '/',
            templateUrl: '/views/dashboard.html',
            controller: 'DashboardController',
            controllerAs: '$ctrl' });


        $stateProvider.
        state('leverton-api', {
            url: '/levertonApi',
            templateUrl: '/views/leverton.html',
            controller: 'LevertonDashboardController',
            controllerAs: '$ctrl' });


        // use the HTML5 History API
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false });

    }]);
})();

/**
       * Created by sajibsarkar on 11/26/17.
       */

(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');

    module.constant("AppConstants", {
        FILE_UPLOAD_URI: 'https://ief0uuoand.execute-api.us-east-1.amazonaws.com/prod/sajibTest',
        FILE_UPLOAD_URI_LOCAL: '/api/files/upload' });

})();
/**
       * Created by sajibsarkar on 11/26/17.
       */

(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');

    var otherPropertyKeys = [
    'tccomparativefinancialstatusirp',
    'rptddelinquentloanstatus',
    'rptmhistoricalloanmod',
    'rptrsvloc',
    // 'rptreostatus',
    'rptwservicerwatchlistirp',
    //'tlr',
    'rptadvrecovery'];


    module.factory('InvestmentTreeHelper', [
    function () {
        return {
            buildTree: function buildTree(data) {
                var treeData = [];
                if (Array.isArray(data)) {
                    data.forEach(function (investment) {
                        var investmentNode = _prepareInvestmentNode(
                        investment);

                        treeData.push(investmentNode);
                    });
                }
                return treeData;
            } };

    }]);


    /***
          * Private methods
          */
    function _prepareChildrenNode(data, params) {
        var propertyName = params.propertyName;
        var nodeName = params.nodeName || propertyName;
        var grandNode = {
            text: nodeName,
            children: [] };


        if (Array.isArray(data)) {
            var dataGroupedByProperty = _.groupBy(data, propertyName);
            Object.keys(dataGroupedByProperty).forEach(function (keyName) {
                var dataItemNode = {
                    text: keyName,
                    children: [],
                    icon: 'none' };

                dataGroupedByProperty[keyName].forEach(function (dataItem) {
                    for (var key in dataItem) {
                        var activeItemNode = {
                            text: [key, dataItem[key]].join(' : '),
                            icon: 'none',
                            children: [] };

                        dataItemNode.children.push(activeItemNode);
                    }
                });
                grandNode.children.push(dataItemNode);
            });
        }
        return grandNode;
    }

    function _prepareLineItemNode(_financial) {

        var grandLineItemNode = {
            text: 'LineItems',
            children: [] };var _loop = function _loop(



        stmtTypeKey) {

            var lineItemNode = {
                text: stmtTypeKey,
                children: [] };


            _.forEach(_financial.lineItems[stmtTypeKey], function (nodeItem) {
                Object.keys(nodeItem).forEach(function (dataKey) {
                    if (!Array.isArray(nodeItem[dataKey])) {
                        var _nodeItem = {
                            text: [dataKey, nodeItem[dataKey]].join(
                            ' : '),

                            icon: 'none' };

                        lineItemNode.children.push(_nodeItem);
                    }
                });
            });
            grandLineItemNode.children.push(lineItemNode);};for (var stmtTypeKey in _financial.lineItems) {_loop(stmtTypeKey);
        }


        /*
           if (Array.isArray(_financial.lineItems)) {
              _financial.lineItems = _financial.lineItems.map(function(item) {
                  if (item.startDate) {
                      item.startDate = new Date(item.startDate);
                  }
                  if (item.endDate) {
                      item.endDate = new Date(item.endDate);
                  }
                  return item;
              });
              let lineItemsGroup = _.groupBy(
                  _financial.lineItems,
                  'categoryCode'
              );
              Object.keys(lineItemsGroup).forEach(function(lineItemGroupKey) {
                  let lineItemNode = _prepareChildrenNode(
                      lineItemsGroup[lineItemGroupKey], {
                          nodeName: lineItemGroupKey,
                          propertyName: 'stmtType'
                      }
                  );
                  grandLineItemNode.children.push(lineItemNode);
              });
          }
          */


        return grandLineItemNode;
    }

    function _prepareFinancialNodes(property) {
        var grandFinancialNode = {
            text: 'Financials',
            children: [] };


        if (Array.isArray(property.financials)) {
            property.financials.map(function (_financial) {
                if (_financial.startDate) {
                    _financial.startDate = new Date(_financial.startDate);
                }
                if (_financial.endDate) {
                    _financial.endDate = new Date(_financial.endDate);
                }
                var financialNode = {
                    text: _financial.startDate,
                    children: [] };

                Object.keys(_financial).forEach(function (financeKey) {
                    if (!Array.isArray(_financial[financeKey])) {
                        var _financeNodeItem = {
                            text: [financeKey, _financial[financeKey]].join(
                            ' : '),

                            icon: 'none' };

                        financialNode.children.push(_financeNodeItem);
                    }
                });
                var grandLineItemNode = _prepareLineItemNode(_financial);
                financialNode.children.push(grandLineItemNode);
                grandFinancialNode.children.push(financialNode);
            });
        }

        return grandFinancialNode;
    }

    function _preparePropertiesNode(investment) {
        var grandPropertiesNode = {
            text: 'Properties',
            children: [] };


        if (Array.isArray(investment.properties)) {
            investment.properties.forEach(function (property) {
                var propertiesNode = {
                    text: property.propertyId,
                    children: [] };


                Object.keys(property).forEach(function (propKey) {
                    if (!Array.isArray(property[propKey])) {
                        var propNodeItem = {
                            text: [propKey, property[propKey]].join(' : '),
                            icon: 'none' };

                        propertiesNode.children.push(propNodeItem);
                    }
                });

                var grandRptreostatusNode = {
                    text: 'rptreostatus',
                    children: [] };

                if (Array.isArray(property.rptreostatus)) {
                    var rptreostatusByDates = _.groupBy(
                    property.rptreostatus,
                    function (item) {
                        return new Date(item.startDate).toDateString();
                    });

                    Object.keys(rptreostatusByDates).forEach(function (
                    __keyName)
                    {
                        var rptreostatusNode = {
                            text: __keyName,
                            children: [] };

                        rptreostatusByDates[__keyName].forEach(function (
                        dataItem)
                        {
                            Object.keys(dataItem).forEach(function (dataKey) {
                                if (!Array.isArray(dataItem[dataKey])) {
                                    var _nodeItem = {
                                        text: [dataKey, dataItem[dataKey]].join(
                                        ' : '),

                                        icon: 'none' };

                                    rptreostatusNode.children.push(_nodeItem);
                                }
                            });
                        });
                        grandRptreostatusNode.children.push(rptreostatusNode);
                    });
                }
                var grandFinancialNode = _prepareFinancialNodes(property);
                propertiesNode.children.push(grandFinancialNode);
                grandPropertiesNode.children.push(propertiesNode);
                if (grandRptreostatusNode.children.length > 0) {
                    propertiesNode.children.push(grandRptreostatusNode);
                }
            });
        }
        return grandPropertiesNode;
    }

    function _prepareOtherPropertyNode(investment, otherPropertyKeys) {
        var _otherGrandNodes = [];

        var uniqDates = [];

        otherPropertyKeys.forEach(function (_otherPropertyKey) {
            if (
            Array.isArray(investment[_otherPropertyKey]) &&
            investment[_otherPropertyKey].length > 0)
            {
                investment[_otherPropertyKey] = investment[
                _otherPropertyKey].
                map(function (item) {
                    if (item.startDate) {
                        item.startDate = new Date(
                        item.startDate).
                        toDateString();
                        if (uniqDates.indexOf(item.startDate) === -1) {
                            uniqDates.push(item.startDate);
                        }
                    }
                    return item;
                });
            }
        });

        uniqDates = _.sortBy(uniqDates, function (item) {return new Date(item);});
        uniqDates.forEach(function (_dtStr) {
            var dateNode = {
                text: _dtStr,
                children: [] };


            otherPropertyKeys.forEach(function (_otherPropertyKey) {
                var otherPropertyNode = {
                    text: _otherPropertyKey,
                    children: [] };


                if (
                Array.isArray(investment[_otherPropertyKey]) &&
                investment[_otherPropertyKey].length > 0)
                {
                    var otherDataByDateAndPropertyKey = investment[
                    _otherPropertyKey].
                    filter(function (data) {
                        return data.startDate && data.startDate === _dtStr;
                    });

                    var otherPropertyGroupedData = void 0;
                    var otherPropertyGroupedKey = void 0;

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
                            break;}


                    if (otherPropertyGroupedKey) {
                        otherPropertyGroupedData = _.groupBy(
                        otherDataByDateAndPropertyKey,
                        otherPropertyGroupedKey);


                        Object.keys(otherPropertyGroupedData).forEach(function (
                        otherPropertyGroupedKeyName)
                        {
                            var _groupedNode = {
                                text: otherPropertyGroupedKeyName,
                                children: [] };

                            otherPropertyGroupedData[
                            otherPropertyGroupedKeyName].
                            forEach(function (dataItem) {
                                Object.keys(dataItem).forEach(function (
                                propKey)
                                {
                                    if (!Array.isArray(dataItem[propKey])) {
                                        var dataNode = {
                                            text: [
                                            propKey,
                                            dataItem[propKey]].
                                            join(' : '),
                                            icon: 'none' };

                                        _groupedNode.children.push(dataNode);
                                    }
                                });
                            });
                            otherPropertyNode.children.push(_groupedNode);
                        });
                    } else {
                        otherDataByDateAndPropertyKey.forEach(function (
                        dataItem)
                        {
                            Object.keys(dataItem).forEach(function (propKey) {
                                if (!Array.isArray(dataItem[propKey])) {
                                    var dataNode = {
                                        text: [propKey, dataItem[propKey]].join(
                                        ' : '),

                                        icon: 'none' };

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
        var investmentNode = {
            text: investment.loanId,
            children: [] };


        Object.keys(investment).forEach(function (key) {
            if (!Array.isArray(investment[key])) {
                var nodeItem = {
                    text: [key, investment[key]].join(' : '),
                    icon: 'none' };

                investmentNode.children.push(nodeItem);
            }
        });

        var grandPropertiesNode = _preparePropertiesNode(investment);
        investmentNode.children.push(grandPropertiesNode);
        var _otherPropertyNode = _prepareOtherPropertyNode(
        investment,
        otherPropertyKeys);

        if (Array.isArray(_otherPropertyNode)) {
            _otherPropertyNode.forEach(function (_node) {
                investmentNode.children.push(_node);
            });
        }

        return investmentNode;
    }
})();

/**
       * Created by sajibsarkar on 12/19/17.
       */


var _module = angular.module('IrpToJsonViewer');

_module.factory('ModalService', [
'$rootScope',
'$http',
'$modal',
function ModalService($rootScope, $http, $modal) {

    return {

        /* /!***
               * Show the confirmation options as bootstrap modal window.
               * @param content
               * @param title
               * @returns {modalInstance.result|*}
               *!/
              showModalConfirmWindow : function (content, title, returnBoth) {
                   var modalInstance = $uibModal.open({
                      animation: true,
                      size: 'sm',
                      templateUrl: '/views/modals/confirm-window.html',
                      controller: 'ConfirmWindowController',
                      backdrop     : true,
                      scope        : $rootScope.$new(true),
                      resolve: {
                          params: function () {
                              return {
                                  content: content,
                                  title: title,
                                  returnBoth: returnBoth
                              };
                          }
                      }
                  });
                   return modalInstance.result;
              },*/


        showXlsxImportEditorWizard: function showXlsxImportEditorWizard(_params, callback) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/views/modals/xlx-import-editor.html',
                controller: 'XlsxImportEditorController',
                controllerAs: '$ctrl',
                backdrop: true,
                size: 'lg',
                scope: $rootScope.$new(true),
                windowClass: 'xlsx-import-modal',
                resolve: {
                    params: function params() {
                        return _params;
                    } } });



            return modalInstance.result;
        } };

}]);


/**
      * Created by sajibsarkar on 3/31/16.
      */


(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');
    var XLSX = require('xlsx');
    var async = require('async');

    /**
                                   * The product list Controller
                                   */
    module.controller('DashboardController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants', 'ModalService', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants, ModalService) {

        var $ctrl = this;

        window.myCtrl = $ctrl;

        var expectedServiceTabs = [
        '_property',
        '_financial',
        'tCComparativeFinancialStatusIRP',
        'rptDDelinquentLoanStatus',
        'rptMHistoricalLoanMod',
        'rptRsvLOC',
        'rptREOStatus',
        'rptWServicerWatchlistIRP',
        'TLR',
        'rptAdvRecovery'];



        function getAvaileAbleServiceTab() {
            $ctrl.availableServiceTabs = expectedServiceTabs.reduce(function (memo, current) {
                memo.push({
                    name: current,
                    isAvailable: false });

                return memo;
            }, []);

            return $ctrl.availableServiceTabs;
        }


        $ctrl.investments = undefined;

        getAvaileAbleServiceTab();

        $scope.$watch('$ctrl.serviceFile', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                setTimeout(adjustAvailableTabs, 10);
            }
        });


        function adjustAvailableTabs() {
            var availableServiceTabs = getAvaileAbleServiceTab();
            readFileSheetName($ctrl.serviceFile);
            $scope.$applyAsync();
        }



        function readFileSheetName(files) {
            var sheetNameMap = {};
            async.eachSeries(files, function (file, next) {

                if (/\.txt$/i.test(file.name) || /\.csv/i.test(file.name)) {
                    ModalService.showXlsxImportEditorWizard({ file: file }).then(function (modifiedFile) {
                        var fIndex = $ctrl.serviceFile.findIndex(function (_file) {return _file === file;});
                        $ctrl.serviceFile.splice(fIndex, 1, modifiedFile);
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var data = e.target.result;
                            var workbook;
                            try {
                                workbook = XLSX.read(data, { type: 'binary' });
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
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook;
                        try {
                            workbook = XLSX.read(data, { type: 'binary' });
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
                }


            }, function () {

                var sheetNameMapKeys = Object.keys(sheetNameMap);

                $ctrl.availableServiceTabs = $ctrl.availableServiceTabs.map(function (item) {
                    var isAvailable = sheetNameMapKeys.some(function (keyNameItem) {
                        return new RegExp(item.name + '$', 'i').test(keyNameItem);
                    });
                    if (isAvailable === true) {
                        item.isAvailable = isAvailable;
                    }

                    return item;
                });

                $scope.$applyAsync();
            });

        }

        $ctrl.uploadFiles = function () {

            var loanText = void 0,serviceText = void 0;

            $ctrl.sumittingFiles = true;
            $ctrl.investments = undefined;
            $.jstree.destroy();

            getBase64($ctrl.loanFile).then(function (res) {
                loanText = res;

                var _promises = [];

                if (Array.isArray($ctrl.serviceFile)) {
                    $ctrl.serviceFile.forEach(function (_serviceFile) {
                        _promises.push(getBase64(_serviceFile));
                    });
                }

                return Promise.all(_promises);

            }).then(function (res) {
                serviceText = res;
                return true;
            }).then(function () {

                var requestParams = {
                    "loanFile": loanText,
                    "serviceFile": serviceText };


                $.ajax(AppConstants.FILE_UPLOAD_URI_LOCAL, {
                    type: 'POST',
                    dataType: 'json',
                    cache: false,
                    processData: false,
                    timeout: 9999999999,
                    contentType: 'application/json; charset=UTF-8',
                    data: JSON.stringify(requestParams),
                    success: function success(resp) {
                        // console.log(resp);
                        $ctrl.investments = resp.Investments;
                        $ctrl.treeJsonData = InvestmentTreeHelper.buildTree(resp.Investments);
                        $('#investmentTreeView').jstree({
                            'core': {
                                data: { text: 'Investments',
                                    state: { opened: true },
                                    children: $ctrl.treeJsonData } } });



                        $ctrl.sumittingFiles = false;
                        $scope.$applyAsync();

                    }, error: function error(resp) {
                        console.log(resp);
                        toastr.error('Error : ' + resp.status);
                        $ctrl.sumittingFiles = false;
                        $scope.$applyAsync();
                    } });
            });
        };


        $ctrl.downloadJson = function () {

            var data = $ctrl.investments;

            //InvestmentJsonFormatHelper.formatDownloadableJson($ctrl.investments);
            var file = new Blob([JSON.stringify(data, null, 4)], {
                type: 'application/json' });

            var fileURL = URL.createObjectURL(file);
            var link = document.createElement('a');

            link.href = fileURL;
            link.target = '_blank';
            link.download = [$ctrl.loanFile.name.replace(/\.\w+/, ''), '.json'].join('');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

    }]);


    function getBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {return resolve(reader.result);};
            reader.onerror = function (error) {return reject(error);};
        });
    }
})();

/**
       * Created by sajibsarkar on 12/13/17.
       */




(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');
    /**
                                                     * The LevertonDashboardController
                                                     */
    module.controller('LevertonDashboardController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants) {

        var $ctrl = this;


    }]);
})();

/**
       * Created by sajibsarkar on 12/19/17.
       */



(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');

    var XLSX = require('xlsx');

    var async = require('async');

    /**
                                   * The product list Controller
                                   */
    module.controller('XlsxImportEditorController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants', 'params', 'ModalService', '$modalInstance', '$sce', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants, params, ModalService, $modalInstance, $sce) {


        var $ctrl = this;


        $ctrl.isProcessing = true;

        $ctrl.contextFile = params.file;

        $ctrl.sheetNameOptions = [
        "_property",
        "_financial",
        'tccomparativefinancialstatusirp',
        'rptddelinquentloanstatus',
        'rptmhistoricalloanmod',
        'rptrsvloc',
        'rptreostatus',
        'rptwservicerwatchlistirp',
        'rptadvrecovery'];


        setTimeout(function () {
            $ctrl.startProcessFile();
        }, 3000);


        function Workbook() {
            if (!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }


        $ctrl.submit = function () {

            if (Array.isArray($ctrl.htmlTables)) {
                var inValidSheetName = $ctrl.htmlTables.find(function (sheetName) {
                    return typeof sheetName === 'undefined' || sheetName === 'Sheet1' || sheetName === null || sheetName === '';
                });

                if (inValidSheetName) {
                    return toastr.error('Not a valid sheet name. Please choose appropriate sheet name.');
                }


                var wb = new Workbook();

                $ctrl.htmlTables.forEach(function (table) {

                    var htmlFrag = table._html.valueOf();

                    var ws = XLSX.utils.table_to_sheet($(htmlFrag)[0]);
                    // let ws = XLSX.utils.aoa_to_sheet([table.rows]);
                    wb.SheetNames.push(table.sheetName);
                    wb.Sheets[table.sheetName] = ws;
                });


                var modifiedFileName = $ctrl.contextFile.name.substring(0, $ctrl.contextFile.name.lastIndexOf('.'));

                var wbout = XLSX.write(wb, { type: 'binary', bookSST: false, bookType: 'xlsx' });


                var s2ab = function s2ab(s) {
                    var buf = new ArrayBuffer(s.length);
                    var view = new Uint8Array(buf);
                    for (var i = 0; i != s.length; ++i) {view[i] = s.charCodeAt(i) & 0xFF;}
                    return buf;
                };


                var modifiedFile = new Blob([s2ab(wbout)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

                modifiedFile.name = modifiedFileName + '.xlsx';
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
            reader.onload = function (e) {
                var data = e.target.result;
                function doitnow() {
                    try {
                        xw(data, process_wb);
                    } catch (e) {
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
                var workbook = XLSX.read(data, { type: 'binary' });
                cb(workbook);
            } catch (ex) {
                var message = 'Failed to read the uploaded file. Please check if it contains unsupported characters or formats.';
                console.log(ex);
                cb(null);
            }

        }

        function fixdata(data) {
            var o = "",l = 0,w = 10240;
            for (; l < data.byteLength / w; ++l) {o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));}
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
            return o;
        }
        function process_wb(wb) {


            if (wb) {
                // console.log('wb', XLSX.utils.sheet_to_row_object_array(wb));
                $ctrl.workbook = wb;
                $ctrl.htmlTables = [];
                wb.SheetNames.forEach(function (sheetName) {
                    //console.log('data', XLSX.utils.aoa_to_sheet(wb["Sheets"][sheetName]));
                    var _htmlStr = XLSX.write(wb, { sheetName: sheetName, bookType: 'html', type: 'binary', editable: true });
                    _htmlStr = _htmlStr.replace('<html><body>', '');
                    _htmlStr = _htmlStr.replace('<table>', '<table class="table table-condensed">');
                    _htmlStr = _htmlStr.replace('</html></body>', '');
                    $ctrl.htmlTables.push({
                        sheetName: sheetName,
                        _html: $sce.trustAsHtml(_htmlStr) });

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
//# sourceMappingURL=app-source-maps/app.js.map
