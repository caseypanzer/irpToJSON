/**
 * Created by sajibsarkar on 3/30/16.
 */

(function () {

    'use strict';

    var module = angular.module("IrpToJsonViewer", ['ui.router', 'ui.bootstrap', 'ui.bootstrap.tpls', 'ngResource', 'toastr', 'ngSanitize', 'ngFileUpload']);


    module.component('tinySpinner', {
        template: ['<div class="tiny-spinner">',
            '<div class="bounce1"></div>',
            '<div class="bounce2"></div>',
            '<div class="bounce3"></div></div>'].join('')});

    /**
     * Router config
     */
    module.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {


            $stateProvider
            .state('dashboard', {
                url: '/',
                templateUrl: '/views/dashboard.html',
                controller: 'DashboardController',
                controllerAs: '$ctrl'
            });


        // use the HTML5 History API
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });


    }]);
})();
