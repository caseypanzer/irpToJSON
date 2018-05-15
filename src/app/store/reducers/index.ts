import {ActionReducerMap,
  createSelector,
  ActionReducer,
  Store,
  select,
  MetaReducer} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { storeFreeze } from 'ngrx-store-freeze';
import * as fromInvestment from './investment.reducer';
import * as fromLoanFileReducer from './loan-file.reducer';
import * as fromLperFileReducer from './lper-file.reducer';
import * as fromServiceFileReducer from './service-file.reducer';



export interface AppState {
  investmentFileUpload: fromInvestment.State;
  loanFileEditor: fromLoanFileReducer.State;
  lperFileEditor: fromLperFileReducer.State;
  serviceFileEditor: fromServiceFileReducer.State
}


export const reducers: ActionReducerMap<AppState> = {
  investmentFileUpload : fromInvestment.reducer,
  loanFileEditor: fromLoanFileReducer.reducer,
  lperFileEditor: fromLperFileReducer.reducer,
  serviceFileEditor: fromServiceFileReducer.reducer
};

// console.log all actions
export function logger(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return function(state: AppState, action: any): AppState {
    console.log('state@logger', state);
    console.log('action@logger', action);
    return reducer(state, action);
  };
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [logger, storeFreeze]
  : [];


/***
 * Selectors for Upload  States
 * @type {MemoizedSelector<AppState, State>}
 */
const getInvestmentUploadState    = createSelector((state: AppState) => state.investmentFileUpload, state => state);
 const getCompletedResultSelector = createSelector (getInvestmentUploadState, fromInvestment.getCompletedResultSelector);
 const getProcessingSelector      = createSelector(getInvestmentUploadState, fromInvestment.getProcessingSelector);
 const getProcessingError         = createSelector(getInvestmentUploadState, fromInvestment.getErrorSelector);
 const getTotalNumberOfInvestment = createSelector(getInvestmentUploadState, fromInvestment.getTotalNumberOfInvestment);
 const getTotalNumberOfAsset      = createSelector(getInvestmentUploadState, fromInvestment.getTotalNumberOfAsset);
 const getTreeState                = createSelector(getInvestmentUploadState, fromInvestment.getTreeData);
 const getInvestmentData          = createSelector(getInvestmentUploadState, fromInvestment.getInvestmentData);


/***
 * Selectors for Loan file Editor
 * @type {{investmentFileUpload: {getInvestmentUploadState: MemoizedSelector<AppState, State>; getCompletedResultSelector: MemoizedSelector<AppState, any>; getProcessingSelector: MemoizedSelector<AppState, any>; getProcessingError: MemoizedSelector<AppState, any>; getTotalNumberOfInvestment: MemoizedSelector<AppState, any>; getTotalNumberOfAsset: MemoizedSelector<AppState, any>}}}
 */
const getLoanFileEditorState         = createSelector((state: AppState) => state.loanFileEditor, state => state);
const getLoanFileInputProcessState   = createSelector(getLoanFileEditorState, fromLoanFileReducer.getInputFileSelectors);
const  getLoanFileErrorState         = createSelector(getLoanFileEditorState, fromLoanFileReducer.getFailedSelectors);
const getLoanFileProcessSuccessState = createSelector(getLoanFileEditorState, fromLoanFileReducer.getConvertedFileSuccessSelectors);


/***
 * Selectors for Lper file Editor
 * @type {{investmentFileUpload: {getInvestmentUploadState: MemoizedSelector<AppState, State>; getCompletedResultSelector: MemoizedSelector<AppState, any>; getProcessingSelector: MemoizedSelector<AppState, any>; getProcessingError: MemoizedSelector<AppState, any>; getTotalNumberOfInvestment: MemoizedSelector<AppState, any>; getTotalNumberOfAsset: MemoizedSelector<AppState, any>}}}
 */
const getLperFileEditorState         = createSelector((state: AppState) => state.lperFileEditor, state => state);
const getLperFileInputProcessState   = createSelector(getLperFileEditorState, fromLperFileReducer.getInputFileSelectors);
const  getLperFileErrorState         = createSelector(getLperFileEditorState, fromLperFileReducer.getFailedSelectors);
const getLperFileProcessSuccessState = createSelector(getLperFileEditorState, fromLperFileReducer.getConvertedFileSuccessSelectors);


/***
 * Selectors for Service file Editor
 * @type {{investmentFileUpload: {getInvestmentUploadState: MemoizedSelector<AppState, State>; getCompletedResultSelector: MemoizedSelector<AppState, any>; getProcessingSelector: MemoizedSelector<AppState, any>; getProcessingError: MemoizedSelector<AppState, any>; getTotalNumberOfInvestment: MemoizedSelector<AppState, any>; getTotalNumberOfAsset: MemoizedSelector<AppState, any>}}}
 */
const getServiceFileEditorState         = createSelector((state: AppState) => state.serviceFileEditor, state => state);
const getServiceFileInputProcessState   = createSelector(getServiceFileEditorState, fromServiceFileReducer.getInputFileSelectors);
const  getServiceFileErrorState         = createSelector(getServiceFileEditorState, fromServiceFileReducer.getFailedSelectors);
const getServiceFileProcessSuccessState = createSelector(getServiceFileEditorState, fromServiceFileReducer.getConvertedFileSuccessSelectors);
const getAvailableSheetNameState        = createSelector(getServiceFileEditorState, fromServiceFileReducer.getAvailableSheetNameSelectors);
const getServicePropertyDataMapSelector = createSelector(getServiceFileEditorState, fromServiceFileReducer.getServicePropertyDataMapSelector);



export const stateSelectors = {
  investmentFileUpload: {
    getInvestmentUploadState,
    getCompletedResultSelector,
    getProcessingSelector,
    getProcessingError,
    getTotalNumberOfInvestment,
    getTotalNumberOfAsset,
    getTreeState,
    getInvestmentData
  },
  loanFileEditor: {
    getLoanFileEditorState,
    getLoanFileInputProcessState,
    getLoanFileErrorState,
    getLoanFileProcessSuccessState
  },
  lperFileEditor: {
    getLperFileEditorState,
    getLperFileInputProcessState,
    getLperFileErrorState,
    getLperFileProcessSuccessState
  },
  serviceFileEditor: {
    getServiceFileEditorState,
    getServiceFileInputProcessState,
    getServiceFileErrorState,
    getServiceFileProcessSuccessState,
    getAvailableSheetNameState,
    getServicePropertyDataMapSelector
  }
};
