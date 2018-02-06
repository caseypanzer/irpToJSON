/**
 * Created by sajibsarkar on 11/26/17.
 */

(function() {
    'use strict';

    let module = angular.module('IrpToJsonViewer');

    module.constant('AppConstants', {
        FILE_UPLOAD_URI:
            'https://ief0uuoand.execute-api.us-east-1.amazonaws.com/prod/sajibTest',
        FILE_UPLOAD_URI_LOCAL: '/api/files/upload',
        SHEET_NAME_OPTIONS: [
            '_property',
            '_financial',
            'tccomparativefinancialstatusirp',
            'rptddelinquentloanstatus',
            'rptmhistoricalloanmod',
            'rptrsvloc',
            'rptreostatus',
            'rptwservicerwatchlistirp',
            'rptadvrecovery'
        ]
    });
})();
