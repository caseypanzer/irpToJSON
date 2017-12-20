/**
 * Created by sajibsarkar on 12/19/17.
 */


let module = angular.module('IrpToJsonViewer');

module.factory('ModalService', [
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
            showXlsxImportEditorWizard: function (params, callback) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '/views/modals/xlx-import-editor.html',
                    controller: 'XlsxImportEditorController',
                    controllerAs: '$ctrl',
                    backdrop: true,
                    size: 'lg',
                    scope           : $rootScope.$new(true),
                    windowClass: 'xlsx-import-modal',
                    resolve: {
                        params: function () {
                            return params;
                        }
                    }
                });

                return modalInstance.result;
            }
        };
    }
]);
