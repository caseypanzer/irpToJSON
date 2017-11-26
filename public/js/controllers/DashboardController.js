/**
 * Created by sajibsarkar on 3/31/16.
 */


(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');


    /**
     * The product list Controller
     */
    module.controller('DashboardController', ['$scope', '$state', 'toastr', 'InvestmentTreeHelper', 'AppConstants', function ($scope, $state, toastr, InvestmentTreeHelper, AppConstants) {

        var $ctrl = this;

        $ctrl.investments = undefined;


        $ctrl.uploadFiles = function () {

            let  loanText,  serviceText;

            $ctrl.sumittingFiles = true;
            $ctrl.investments = undefined;
            $.jstree.destroy();

            getBase64($ctrl.loanFile).then(res => {
                loanText  =  res;
                return  getBase64($ctrl.serviceFile);
            }).then((res)=>{
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
                    timeout  : 600 * 1000,
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
