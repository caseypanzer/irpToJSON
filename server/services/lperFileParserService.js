/**
 * Created by sajibsarkar on 4/3/18.
 */

const _ = require('lodash');
const moment = require('moment');

var IprFields = [
    { name: 'transactionId', type: 'an', example: 'XXX97001' },
    { name: 'groupId', type: 'an', example: 'XXX9701A' },
    { name: 'loanId', type: 'an', example: '12345' },
    { name: 'prospectusLoanId', type: 'an', example: '123' },
    { name: 'distributionDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'currentBeginningScheduledBalance', type: 'numeric', example: '100000' },
    { name: 'currentEndingScheduledBalance', type: 'numeric', example: '100000' },
    { name: 'paidThroughDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'currentIndexRate', type: 'numeric', example: '0.09' },
    { name: 'currentNoteRate', type: 'numeric', example: '0.09' },
    { name: 'maturityDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'servicerAndTrusteeFeeRate', type: 'numeric', example: '0.00025' },
    { name: 'feeRateStripRate1', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate2', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate3', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate4', type: 'numeric', example: '0.00001' },
    { name: 'feeRateStripRate5', type: 'numeric', example: '0.00001' },
    { name: 'netRate', type: 'numeric', example: '0.0947' },
    { name: 'nextIndexRate', type: 'numeric', example: '0.09' },
    { name: 'nextNoteRate', type: 'numeric', example: '0.09' },
    { name: 'nextRateAdjustmentDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'nextPaymentAdjustmentDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'scheduledInterestAmount', type: 'numeric', example: '1000' },
    { name: 'scheduledPrincipalAmount', type: 'numeric', example: '1000' },
    { name: 'totalScheduledPIDue', type: 'numeric', example: '1000' },
    { name: 'negativeAmortizationDeferredInterestCapitalizedAmount', type: 'numeric', example: '1000' },
    { name: 'unscheduledPrincipalCollections', type: 'numeric', example: '1000' },
    { name: 'otherPrincipalAdjustments', type: 'numeric', example: '1000' },
    { name: 'liquidationPrepaymentDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'prepaymentPremiumYieldMaintenanceYmReceived', type: 'numeric', example: '1000' },
    { name: 'prepaymentInterestExcessShortfall', type: 'numeric', example: '1000' },
    { name: 'liquidationPrepaymentCode', type: 'numeric', example: '1' },
    { name: 'mostRecentNetAserAmount', type: 'numeric', example: '1000' },
    { name: 'emptyFieldFkaMostRecentAserDate', type: '', example: 'EMPTY' },
    { name: 'cumulativeAserAmount', type: 'numeric', example: '1000' },
    { name: 'actualBalance', type: 'numeric', example: '100000' },
    { name: 'totalPIAdvanceOutstanding', type: 'numeric', example: '1000' },
    { name: 'totalTIAdvanceOutstanding', type: 'numeric', example: '1000' },
    { name: 'otherExpenseAdvanceOutstanding', type: 'numeric', example: '1000' },
    { name: 'paymentStatusOfLoanFkaStatusOfLoan', type: 'an', example: '1' },
    { name: 'inBankruptcyYN', type: 'boolean', example: 'Y' },
    { name: 'foreclosureStartDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'reoDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'bankruptcyDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'netProceedsReceivedOnLiquidation', type: 'numeric', example: '100000' },
    { name: 'liquidationExpense', type: 'numeric', example: '100000' },
    { name: 'realizedLossToTrust', type: 'numeric', example: '10000' },
    { name: 'dateOfLastModification', type: 'date', format: 'YYYYMMDD' },
    { name: 'modificationCode', type: 'numeric', example: '1' },
    { name: 'modifiedNoteRate', type: 'numeric', example: '0.09' },
    { name: 'modifiedPaymentAmount', type: 'numeric', example: '1000' },
    { name: 'precedingFiscalYearRevenue', type: 'numeric', example: '1000' },
    { name: 'precedingFiscalYearOperatingExpenses', type: 'numeric', example: '1000' },
    { name: 'precedingFiscalYearNoi', type: 'numeric', example: '1000' },
    { name: 'precedingFiscalYearDebtSvcAmount', type: 'numeric', example: '1000' },
    { name: 'precedingFiscalYearDscrNoi', type: 'numeric', example: '2.55' },
    { name: 'precedingFiscalYearPhysicalOccupancy', type: 'numeric', example: '0.85' },
    { name: 'precedingFiscalYearFinancialAsOfDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'secondPrecedingFiscalYearRevenue', type: 'numeric', example: '1000' },
    { name: 'secondPrecedingFiscalYearOperatingExpenses', type: 'numeric', example: '1000' },
    { name: 'secondPrecedingFiscalYearNoi', type: 'numeric', example: '1000' },
    { name: 'secondPrecedingFiscalYearDebtServiceAmount', type: 'numeric', example: '1000' },
    { name: 'secondPrecedingFiscalYearDscrNoi', type: 'numeric', example: '2.55' },
    { name: 'secondPrecedingFiscalYearPhysicalOccupancy', type: 'numeric', example: '0.85' },
    { name: 'secondPrecedingFiscalYearFinancialAsOfDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'mostRecentRevenue', type: 'numeric', example: '1000' },
    { name: 'mostRecentOperatingExpenses', type: 'numeric', example: '1000' },
    { name: 'mostRecentNoi', type: 'numeric', example: '1000' },
    { name: 'mostRecentDebtServiceAmount', type: 'numeric', example: '1000' },
    { name: 'mostRecentDscrNoi', type: 'numeric', example: '2.55' },
    { name: 'mostRecentPhysicalOccupancy', type: 'numeric', example: '0.85' },
    { name: 'mostRecentFinancialAsOfStartDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'mostRecentFinancialAsOfEndDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'mostRecentValuationDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'mostRecentValue', type: 'numeric', example: '100000' },
    { name: 'workoutStrategy', type: 'numeric', example: '1' },
    { name: 'mostRecentSpecialServicerTransferDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'mostRecentMasterServicerReturnDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'dateAssetExpectedToBeResolvedOrForeclosed', type: 'date', format: 'YYYYMMDD' },
    { name: 'emptyFieldFkaYearRenovated', type: '', example: 'EMPTY' },
    { name: 'currentHyperAmortizingDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'mostRecentFinancialIndicator', type: 'an', example: 'TA' },
    { name: 'lastSetupChangeDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'lastLoanContributionDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'lastPropertyCollateralContributionDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'numberOfProperties', type: 'numeric', example: '13' },
    { name: 'precedingFiscalYearDscrIndicator', type: 'an', example: 'Text' },
    { name: 'secondPrecedingFiscalYearDscrIndicator', type: 'an', example: 'Text' },
    { name: 'mostRecentDscrIndicator', type: 'an', example: 'Text' },
    { name: 'noiNcfIndicator', type: 'an', example: 'Text' },
    { name: 'dateOfAssumption', type: 'date', format: 'YYYYMMDD' },
    { name: 'precedingFiscalYearNcf', type: 'numeric', example: '1000' },
    { name: 'precedingFiscalYearDscrNcf', type: 'numeric', example: '2.55' },
    { name: 'secondPrecedingFiscalYearNcf', type: 'numeric', example: '1000' },
    { name: 'secondPrecedingFiscalYearDscrNcf', type: 'numeric', example: '2.55' },
    { name: 'mostRecentNcf', type: 'numeric', example: '1000' },
    { name: 'mostRecentDscrNcf', type: 'numeric', example: '1000' },
    { name: 'defeasanceStatus', type: 'an', example: 'Text' },
    { name: 'araAppraisalReductionAmount', type: 'numeric', example: '1000' },
    { name: 'araDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'emptyFieldFkaCreditTenantLease', type: '', example: 'EMPTY' },
    { name: 'otherInterestAdjustment', type: 'numeric', example: '1000' },
    { name: 'cumulativeAccruedUnpaidAdvanceInterest', type: 'numeric', example: '1000' },
    { name: 'totalReserveBalance', type: 'numeric', example: '1000' },
    { name: 'dateAddedToServicerWatchlist', type: 'date', format: 'YYYYMMDD' },
    { name: 'specialServicingFeeAmountPlusAdjustments', type: 'numeric', example: '1000' },
    { name: 'reimbursedInterestOnAdvances', type: 'numeric', example: '1000' },
    { name: 'workoutFeeAmount', type: 'numeric', example: '1000' },
    { name: 'liquidationFeeAmount', type: 'numeric', example: '1000' },
    { name: 'nonRecoverabilityDetermined', type: 'boolean', example: 'Y' },
    { name: 'closingDateOfOriginalDocumentPermittedExtension', type: 'date', format: 'YYYYMMDD' },
    { name: 'totalLoanAmountAtOrigination', type: 'numeric', example: '1000' },
    { name: 'currentLockboxStatusFkaEmptyField', type: 'an', example: '1' },
    { name: 'liquidationSalesPrice', type: 'numeric', example: '1000' },
    { name: 'amountsDueServicersAndTrustee', type: 'numeric', example: '1000' },
    { name: 'amountsHeldBackForFuturePayment', type: 'numeric', example: '1000' },
    { name: 'accruedInterest', type: 'numeric', example: '1000' },
    { name: 'additionalTrustFundExpense', type: 'numeric', example: '1000' },
    { name: 'currentPeriodAdjustmentToLoanPrincipal', type: 'numeric', example: '1000' },
    { name: 'dateOfCurrentPeriodAdjustmentToLoan', type: 'date', format: 'YYYYMMDD' },
    { name: 'cumulativeAdjustmentsToLoan', type: 'numeric', example: '1000' },
    { name: 'advancedByTrustNonRecoverableReimbursementsToServicerCurrentMonth', type: 'numeric', example: '1000' },
    { name: 'anticipatedAmountToBeAdvancedByTrustLeftToReimburseServicer', type: 'numeric', example: '1000' },
    { name: 'otherShortfallsRefundsFkaOtherShortfallsRefunds', type: 'numeric', example: '1000' },
    { name: 'deferredInterestCumulative', type: 'numeric', example: '1000' },
    { name: 'deferredInterestCollected', type: 'numeric', example: '1000' },
    { name: 'reasonForSsTransfer', type: 'an', example: 'Text' },
    { name: 'advancedByTrustCumulative', type: 'numeric', example: '1000' },
    { name: 'nonCashPrincipalAdjustment', type: 'numeric', example: '1000' },
    { name: 'modificationExecutionDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'modificationBookingDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'currentPeriodAdjustmentToLoanOther', type: 'numeric', example: '1000' },
    { name: 'masterServicer', type: 'an', example: 'Text' },
    { name: 'specialServicer', type: 'an', example: 'Text' },
    { name: 'reportingPeriodBeginDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'reportingPeriodEndDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'modificationIndicator', type: 'boolean', example: 'Y' },
    { name: 'assetSubjectToDemand', type: 'boolean', example: 'Y' },
    { name: 'statusOfAssetSubjectToDemand', type: 'numeric', example: '1' },
    { name: 'demandResolutionDate', type: 'date', format: 'YYYYMMDD' },
    { name: 'repurchaseOrReplacementReason', type: 'numeric', example: '1' },
    { name: 'postModificationAmortizationPeriod', type: 'numeric', example: '360' },
    { name: 'currentNonRecoverableInterest', type: 'numeric', example: '1000' },
    { name: 'cumulativeNonRecoverableInterest', type: 'numeric', example: '1000' },
    { name: 'leadTransactionId', type: 'an', example: 'XXX97001' },
    { name: 'ardInterestCumulative', type: 'numeric', example: '1000' },
    { name: 'anticipatedRepaymentDateArdInterestCollected', type: 'numeric', example: '1000' },
    {name: 'advancedByTrustWorkoutDelayedReimbursementAmountsWodraToServicerCurrentMonth',
        type: 'numeric',
        example: '1000'
    },
    { name: 'disclosableSpecialServicingFees', type: 'numeric', example: '1000' },
    { name: 'repurchaseAmount', type: 'numeric', example: '1000' },
    { name: 'excessLiquidationProceeds', type: 'numeric', example: '1000' }
];

module.exports.mapLperData = function(data) {
    let results = [];
    if (Array.isArray(data)) {
        let emptyColumnPos = {};
        data.map(function(dataRowItems) {
            let resultItem = {};
            if (Array.isArray(dataRowItems) && dataRowItems.length > 0) {
                let len = _.size(dataRowItems);
                for (let i = 0; i < len; i++) {
                    let fieldItem = IprFields[i];
                    if (fieldItem && fieldItem.name) {
                        let __val = dataRowItems[i];
                        if (fieldItem.type === 'date') {
                            if (fieldItem.format && __val) {
                                __val = moment(__val, fieldItem.format).toDate();
                                __val.setHours(0);
                                __val.setMinutes(0);
                                __val.setSeconds(0);
                            } else  if(__val) {
                                __val = new Date(__val);
                                __val.setHours(0);
                                __val.setMinutes(0);
                                __val.setSeconds(0);
                            }
                        } else if (fieldItem.type === 'numeric') {
                            __val = parseFloat(__val.toString());
                            if(isNaN(__val)){
                                __val = null;
                            }
                        } else if (fieldItem.type === 'boolean') {
                            if((__val === true || __val === 'true' || __val === 'True'|| __val === 'TRUE' || __val === 1 || __val === '1' || __val === 'Y' || __val === 'Y') ){
                                __val = true;
                            } else if((__val === false || __val === 'false' || __val === 'False' || __val === 'FALSE'  || __val === 0 || __val === '0' || __val === 'N' || __val === 'n') ){
                                __val = false;
                            }

                        }

                        resultItem[fieldItem.name] = __val;
                    }
                }
            }
            // console.log('rowItems.length', dataRowItems.length);

            // console.log('resultItem', resultItem);
            if (Object.keys(resultItem).length > 0) {

                results.push(resultItem);
            }
        });

        //console.log('emptyColumnPos', emptyColumnPos);
    }
    //console.log('resultItem', _.head(results));
    return results;
};
