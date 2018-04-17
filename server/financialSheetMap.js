/**
 * Created by sajibsarkar on 4/17/18.
 */

const financialSheetMapper = {
    property: { name: 'property' },
    financial: { name: 'financial' },
    tccomparativefinancialstatusirp: { name: 'tccomparativefinancialstatusirp', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptddelinquentloanstatus: { name: 'rptddelinquentloanstatus', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptmhistoricalloanmod: { name: 'rptmhistoricalloanmod', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptrsvloc: { name: 'rptrsvloc', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptreostatus: { name: 'rptreostatus', isHeaderRowExists: true, primaryKey: 'propertyId' },
    rptwservicerwatchlistirp: { name: 'rptwservicerwatchlistirp', isHeaderRowExists: true, primaryKey: 'loanId' },
    rpttotalloan: { name: 'rpttotalloan', isHeaderRowExists: true, primaryKey: 'loanId' },
    rptadvrecovery: { name: 'rptadvrecovery', isHeaderRowExists: true, primaryKey: 'loanId' },
    lpr: { name: 'lpr', isHeaderRowExists: false, primaryKey: 'loanId' }
};


module.exports.financialSheetMapper = financialSheetMapper;
