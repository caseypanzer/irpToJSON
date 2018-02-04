/**
 * Created by sajibsarkar on 1/29/18.
 */

'use strict';

import "babel-polyfill";


var  vendorJSList = [
    'public/bower_components/jquery/dist/jquery.js',
    'public/bower_components/jquery-ui/jquery-ui.js',
    'public/bower_components/angular/angular.js',
    'public/bower_components/angular-animate/angular-animate.js',
    'public/bower_components/angular-sanitize/angular-sanitize.js',
    'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    'public/bower_components/angular-aria/angular-aria.js',
    'public/bower_components/angular-ui-router/release/angular-ui-router.js',
    'public/bower_components/AngularJS-Toaster/toaster.js',
    'public/bower_components/angular-cookies/angular-cookies.js',
    'public/bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
    'public/bower_components/angular-native-dragdrop/draganddrop.js',
    'public/bower_components/ng-file-upload/ng-file-upload-shim.js',
    'public/bower_components/ng-file-upload/ng-file-upload.js',
    'public/bower_components/angular-translate/angular-translate.js',
    'public/bower_components/socket.io-client/socket.io.js',
    'public/bower_components/moment/moment.js',
    'public/bower_components/bootstrap/dist/js/bootstrap.js',
    'public/bower_components/ngstorage/ngStorage.js',
    'public/bower_components/angular-messages/angular-messages.js',
    'public/bower_components/angular-filter/dist/angular-filter.min.js',
    'public/bower_components/async/dist/async.js',
    'public/bower_components/angular-resource/angular-resource.js',
    'public/bower_components/d3/d3.js',
    'public/bower_components/pdfjs-bower/dist/compatibility.js',
    'public/bower_components/pdfjs-bower/dist/pdf.js',
    'public/bower_components/es6-shim/es6-shim.js',
    'public/bower_components/lodash/lodash.js',
    'public/bower_components/js-xlsx/dist/xlsx.full.min.js',
    'public/bower_components/file-saver/FileSaver.min.js',
    'public/bower_components/textAngular/dist/textAngular-rangy.min.js',
    'public/bower_components/textAngular/dist/textAngular-sanitize.min.js',
    'public/bower_components/textAngular/dist/textAngular.min.js',
    'public/bower_components/angular-ui-calendar/src/calendar.js',
    'public/bower_components/fullcalendar/dist/fullcalendar.js',
    'public/bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022.min.js',
    'public/bower_components/mathjs/dist/math.js',
    'public/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.js',
    'public/bower_components/twilio-video/dist/twilio-video.js',
    'public/bower_components/angular-esri-map/dist/angular-esri-map.js',

    //'public/bower_components/fullcalendar/dist/gcal.js',
    //Non-bower components
    'public/non-bower/type-ahead.js',
    'public/non-bower/desktop-notify.js',
    'public/non-bower/angular-web-notification.js',
    'public/non-bower/crypto-js/rollups/aes.js',
    'public/non-bower/crypto-js/components/mode-cfb.js',
    'public/non-bower/scrollMonitor.js',
    //'public/non-bower/angular-viewport-watch.js',
    'public/non-bower/jquery-formula/src/js/pignose.formula.build.js',
    //for excel formula
    'public/non-bower/excel/formula.min.js',
    'public/non-bower/jquery.ui.touch-punch.min.js'
];
var distPath,appSrc ,saasFiles, htmlTemplatesSrc;

var targetOuput = gutil.env.target || 'web';

console.log('Target Output: ', targetOuput);
var  vendorJSList = [
    'public/bower_components/jquery/dist/jquery.js',
    'public/bower_components/jquery-ui/jquery-ui.js',
    'public/bower_components/angular/angular.js',
    'public/bower_components/angular-animate/angular-animate.js',
    'public/bower_components/angular-sanitize/angular-sanitize.js',
    'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    'public/bower_components/angular-aria/angular-aria.js',
    'public/bower_components/angular-ui-router/release/angular-ui-router.js',
    'public/bower_components/AngularJS-Toaster/toaster.js',
    'public/bower_components/angular-cookies/angular-cookies.js',
    'public/bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
    'public/bower_components/angular-native-dragdrop/draganddrop.js',
    'public/bower_components/ng-file-upload/ng-file-upload-shim.js',
    'public/bower_components/ng-file-upload/ng-file-upload.js',
    'public/bower_components/angular-translate/angular-translate.js',
    'public/bower_components/socket.io-client/socket.io.js',
    'public/bower_components/moment/moment.js',
    'public/bower_components/bootstrap/dist/js/bootstrap.js',
    'public/bower_components/ngstorage/ngStorage.js',
    'public/bower_components/angular-messages/angular-messages.js',
    'public/bower_components/angular-filter/dist/angular-filter.min.js',
    'public/bower_components/async/dist/async.js',
    'public/bower_components/angular-resource/angular-resource.js',
    'public/bower_components/d3/d3.js',
    'public/bower_components/pdfjs-bower/dist/compatibility.js',
    'public/bower_components/pdfjs-bower/dist/pdf.js',
    'public/bower_components/es6-shim/es6-shim.js',
    'public/bower_components/lodash/lodash.js',
    'public/bower_components/js-xlsx/dist/xlsx.full.min.js',
    'public/bower_components/file-saver/FileSaver.min.js',
    'public/bower_components/textAngular/dist/textAngular-rangy.min.js',
    'public/bower_components/textAngular/dist/textAngular-sanitize.min.js',
    'public/bower_components/textAngular/dist/textAngular.min.js',
    'public/bower_components/angular-ui-calendar/src/calendar.js',
    'public/bower_components/fullcalendar/dist/fullcalendar.js',
    'public/bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022.min.js',
    'public/bower_components/mathjs/dist/math.js',
    'public/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.js',
    'public/bower_components/twilio-video/dist/twilio-video.js',
    'public/bower_components/angular-esri-map/dist/angular-esri-map.js',

    //'public/bower_components/fullcalendar/dist/gcal.js',
    //Non-bower components
    'public/non-bower/type-ahead.js',
    'public/non-bower/desktop-notify.js',
    'public/non-bower/angular-web-notification.js',
    'public/non-bower/crypto-js/rollups/aes.js',
    'public/non-bower/crypto-js/components/mode-cfb.js',
    'public/non-bower/scrollMonitor.js',
    //'public/non-bower/angular-viewport-watch.js',
    'public/non-bower/jquery-formula/src/js/pignose.formula.build.js',
    //for excel formula
    'public/non-bower/excel/formula.min.js',
    'public/non-bower/jquery.ui.touch-punch.min.js'
];

switch (gutil.env.target) {
    case "ios":
        distPath = path.resolve("./mobile/www/web");
        appSrc = [
            'mobile/www/js/app.js',
            'public/js/controllers/HomeController.js',
            'public/js/controllers/chat/*.js',
            'public/js/controllers/shared/*.js',
            'public/js/interceptors/*.js',
            'public/js/services/contacts/*.js',
            'public/js/services/chat/*.js',
            'public/js/services/shared/AuthService.js',
            'public/js/services/shared/RaygunService.js',
            'public/js/services/shared/RequestService.js',
            'public/js/services/shared/UtilService.js',
            'public/js/services/shared/StaticDataService.js',
            'public/js/services/shared/ModalService.js',
            'public/js/services/shared/GlobalDataStoreService.js',
            'public/js/services/tasks/IssueService.js',
            'public/js/services/socket/*.js',
            'public/js/data/states.js'
        ];

        saasFiles = ['public/styles/sass/base-mobile.scss'];
        htmlTemplatesSrc = ['templates/home.html', 'templates/login.html', 'templates/chat/*.html'];
        break;
    default:
        appSrc = ['public/js/**/*.js'];
        htmlTemplatesSrc = ['templates/**/*.html'];
}
vendorJSList.map(fileName=>{

    require(`./${fileName}`);

});
require("./public/bower_components/jquery/dist/jquery.js");
import "./public/bower_components/jquery-ui/jquery-ui.js";
import "./public/bower_components/angular/angular.js";

//console.log('App Src', appSrc);
