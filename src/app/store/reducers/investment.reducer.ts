import { InvestmentActionTypes, InvestmentActions } from '../actions/investment.actions';

import * as _ from 'lodash';

import {InvestmentTreeHelperService} from '../../helpers/investment-tree-helper.service';

export interface State {
  data: Object;
  processing: boolean;
  error: string;
  formData: FormData;
  totalNumberOfInvestment: number;
  totalNumberOfAsset: number;
  processcompleted: boolean;
  investmentData: any[];
  treeJsonData: {};
}

const initialState: State = {
  data : undefined,
  processing: false,
  error: null,
  formData : undefined,
  totalNumberOfInvestment: 0,
  totalNumberOfAsset: 0,
  processcompleted: false,
  investmentData: [],
  treeJsonData: undefined,
};

 const investmentTreeHelperService = new InvestmentTreeHelperService();

export function reducer(state: State = initialState, action: InvestmentActions ): State {
  switch (action.type) {
    case InvestmentActionTypes.UPLOAD: {
      const newState = {
        ...state,
        processing: true,
        formData: action.payload,
        processcompleted: false
      };
      return newState;
    }

    case InvestmentActionTypes.UPLOAD_SUCCESS: {
      const newState = {
        ...state,
        data: action.payload,
        processing: false,
        processcompleted: true
      };
      const _totalNumberOfInvestment = newState.data && newState.data.Investments ?  _.size(newState.data.Investments) : 0;
      let _totalNumberOfAsset = 0;
      if (newState.data && newState.data.Investments && Array.isArray(newState.data.Investments)) {
        _totalNumberOfAsset = newState.data.Investments.reduce(function (memo: number, current: any): any {
          if (current && Array.isArray(current.properties)) {
            memo += _.size(current.properties);
          }
          return memo;
        }, 0);

      }
      newState.investmentData = newState.data.Investments;
      newState.totalNumberOfAsset = _totalNumberOfAsset;
      newState.totalNumberOfInvestment = _totalNumberOfInvestment;
      return newState;
    }

    case InvestmentActionTypes.GENERATE_TREE: {
      const { payload } = action;
      const treeJsonData = [{
        name: 'Investments',
        children: investmentTreeHelperService.buildTree(_.cloneDeep(state.investmentData))
      }];
      const newState = {
        ...state,
        processing: false,
        processcompleted: true,
        treeJsonData:  treeJsonData
      };
      return newState;
    }

    case InvestmentActionTypes.UPLOAD_FAIL: {
      const newState = {
        ...state,
        processing: false,
        processcompleted: true,
        error: action.payload
      };
      return newState;
    }

    default: {
      return state;
    }

  }
}




export  const  getCompletedResultSelector =  state => state.data;

export  const  getProcessingSelector =  state => state.processing;

export const getErrorSelector = state => state.error;

export const   getTotalNumberOfInvestment  = state => state.totalNumberOfInvestment;

export const   getTotalNumberOfAsset = state => state.totalNumberOfAsset;

export const getTreeData = state => state.treeJsonData;

export const getInvestmentData = state => state.investmentData;
