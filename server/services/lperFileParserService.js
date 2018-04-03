/**
 * Created by sajibsarkar on 4/3/18.
 */

const _ = require('lodash');
const moment = require('moment');

var IprFields = [
    { name: 'transactionId', type: 'an', example: 'XXX97001' },
    { name: 'loanId', type: 'an', example: 'XXX9701A' },
    { name: 'prospectusLoanId', type: 'an', example: '12345' },
    { name: 'originalNoteAmount', type: 'numeric', example: '1000000' },
    { name: 'originalTermOfLoan', type: 'numeric', example: '240' },
    { name: 'originalAmortizationTerm', type: 'numeric', example: '360' },
    { name: 'originalNoteRate', type: 'numeric', example: '0.095' },
    { name: 'originalPaymentRate', type: 'numeric', example: '0.095' },
    { name: 'firstLoanPaymentDueDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'graceDaysAllowed', type: 'numeric', example: '10' },
    { name: 'interestOnlyYN', type: 'an', example: 'Y' },
    { name: 'balloonYN', type: 'an', example: 'Y' },
    { name: 'interestRateType', type: 'numeric', example: '1' },
    { name: 'interestAccrualMethod', type: 'numeric', example: '1' },
    { name: 'interestInArrearsYN', type: 'an', example: 'Y' },
    { name: 'paymentType', type: 'numeric', example: '1' },
    { name: 'prepaymentLockOutEndDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'yieldMaintenanceEndDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'prepaymentPremiumEndDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'prepaymentTermsDescription', type: 'an', example: 'Text' },
    { name: 'armIndex', type: 'an', example: 'A' },
    { name: 'firstRateAdjustmentDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'firstPaymentAdjustmentDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'armMargin', type: 'numeric', example: '0.025' },
    { name: 'lifetimeRateCap', type: 'numeric', example: '0.15' },
    { name: 'lifetimeRateFloor', type: 'numeric', example: '0.05' },
    { name: 'periodicRateIncreaseLimit', type: 'numeric', example: '0.02' },
    { name: 'periodicRateDecreaseLimit', type: 'numeric', example: '0.02' },
    { name: 'periodicPayAdjustmentMax', type: 'numeric', example: '0.03' },
    { name: 'periodicPayAdjustmentMax', type: 'numeric', example: '5000' },
    { name: 'paymentFrequency', type: 'numeric', example: '1' },
    { name: 'rateResetFrequency', type: 'numeric', example: '1' },
    { name: 'payResetFrequency', type: 'numeric', example: '1' },
    { name: 'roundingCode', type: 'numeric', example: '1' },
    { name: 'roundingIncrement', type: 'numeric', example: '0.00125' },
    { name: 'indexLookBackInDays', type: 'numeric', example: '45' },
    { name: 'negativeAmortizationAllowedYN', type: 'an', example: 'Y' },
    { name: 'maxNegAllowedOfOrigBal', type: 'numeric', example: '0.075' },
    { name: 'maximumNegateAllowed', type: 'numeric', example: '25000' },
    { name: 'remainingTermAtContribution', type: 'numeric', example: '240' },
    { name: 'remainingAmortTermAtContribution', type: 'numeric', example: '360' },
    { name: 'maturityDateAtContribution', type: 'date', format: 'YYYYMMDD' },
    { name: 'scheduledPrincipalBalanceAtContribution', type: 'numeric', example: '1000000' },
    { name: 'noteRateAtContribution', type: 'numeric', example: '0.095' },
    { name: 'servicerAndTrusteeFeeRate', type: 'numeric', example: '0.00025' },
    { name: 'feeRateStripRate1', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate2', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate3', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate4', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate5', type: 'numeric', example: '0.00001' },
    { name: 'netRateAtContribution', type: 'numeric', example: '0.0947' },
    { name: 'periodicPIPaymentAtContribution', type: 'numeric', example: '3000' },
    { name: 'numberOfPropertiesAtContribution', type: 'numeric', example: '13' },
    { name: 'propertyName', type: 'an', example: 'Text' },
    { name: 'propertyAddress', type: 'an', example: 'Text' },
    { name: 'propertyCity', type: 'an', example: 'Text' },
    { name: 'propertyState', type: 'an', example: 'Text' },
    { name: 'propertyZipCode', type: 'an', example: 'Text' },
    { name: 'propertyCounty', type: 'an', example: 'Text' },
    { name: 'propertyType', type: 'an', example: 'MF' },
    { name: 'netRentableSquareFeetAtContribution', type: 'numeric', example: '25000' },
    { name: 'numberOfUnitsBedsRoomsAtContribution', type: 'numeric', example: '75' },
    { name: 'yearBuilt', type: 'an', example: 'YYYY' },
    { name: 'noiAtContribution', type: 'numeric', example: '100000' },
    { name: 'dscrNoiAtContribution', type: 'numeric', example: '2.11' },
    { name: 'valuationAmountAtContribution', type: 'numeric', example: '1000000' },
    { name: 'valuationDateAtContribution', type: 'date', format: 'YYYYMMDD' },
    { name: 'physicalOccupancyAtContribution', type: 'numeric', example: '0.88' },
    { name: 'revenueAtContribution', type: 'numeric', example: '100000' },
    { name: 'operatingExpensesAtContribution', type: 'numeric', example: '100000' },
    { name: 'contributionFinancialsAsOfDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'recourseYN', type: 'an', example: 'Y' },
    { name: 'emptyFieldFkaGroundLeaseYSN', type: '', example: 'EMPTY' },
    { name: 'crossCollateralizedLoanGrouping', type: 'an', example: 'Text' },
    { name: 'collectionOfEscrowYN', type: 'an', example: 'Y' },
    { name: 'collectionOfOtherReservesYN', type: 'an', example: 'Y' },
    { name: 'lienPositionAtContribution', type: 'numeric', example: '1' },
    { name: 'currentHyperAmortizingDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'defeasanceOptionStartDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'emptyFieldFkaDefeasanceOptionEndDate', type: '', example: 'EMPTY' },
    { name: 'lastSetupChangeDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'ncfAtContribution', type: 'numeric', example: '100000' },
    { name: 'dscrNcfAtContribution', type: 'numeric', example: '2.11' },
    { name: 'dscrIndicatorAtContribution', type: 'an', example: 'Text' },
    { name: 'loanContributorToSecuritization', type: 'an', example: 'Text' },
    { name: 'creditTenantLeaseYN', type: 'an', example: 'Y' },
    { name: 'financialInformationSubmissionPenalties', type: 'an', example: 'M' },
    { name: 'additionalFinancingIndicator', type: 'numeric', example: '0' },
    { name: 'loanStructure', type: 'an', example: 'WL' },
    { name: 'originationDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'originalInterestOnlyTerm', type: 'numeric', example: '360' },
    { name: 'underwritingIndicator', type: 'an', example: 'Y' },
    { name: 'servicingAdvanceMethodology', type: 'numeric', example: '1' },
    { name: 'valuationSourceAtContribution', type: 'numeric', example: '1' }
];



module.exports.mapLperData = function (data) {
    let results = [];
    if(Array.isArray(data)){
        let emptyColumnPos = {};
        data.map(function (dataRowItems) {
            let resultItem = {};
            if(Array.isArray(dataRowItems) &&  dataRowItems.length > 0){
                let len = _.size(dataRowItems);
                for(let  i=0; i <  len; i++){
                    let fieldItem  =  IprFields[i];
                    if(fieldItem &&  fieldItem.name){
                        let __val = dataRowItems[i];
                        if(fieldItem.type === 'date'){
                            if(fieldItem.format){
                                __val = moment(__val, fieldItem.format).toDate();
                            } else {
                                __val = new Date(__val);
                            }
                        } else if(fieldItem.type === 'numeric'){
                            __val = parseFloat(__val.toString());
                        }
                        resultItem[fieldItem.name]  = __val;
                    }
                }
            }
           // console.log('rowItems.length', dataRowItems.length);

           // console.log('resultItem', resultItem);
            if(Object.keys(resultItem).length > 0){
                results.push(resultItem);
            }

        });


        //console.log('emptyColumnPos', emptyColumnPos);
    }
    return  results;
};
