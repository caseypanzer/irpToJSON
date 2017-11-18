/**
 * Created by sajibsarkar on 5/24/17.
 */

(function () {
    'use strict';

    var module = angular.module('IrpToJsonViewer');


    /**
     * Invoice services
     */
    module.factory('DashboardService', ['$resource', function ($resource) {
        return $resource('/api/cmbfiles', { id: '@_id' });
    }]);
}) ();