/**
 * Created by sajibsarkar on 4/29/18.
 */

import {Action} from '@ngrx/store';

export enum InvestmentActionTypes {
  UPLOAD           = '[Upload] Files',
  UPLOAD_SUCCESS   = '[Upload] Complete',
  UPLOAD_FAIL      = '[Upload] Fail',
  GENERATE_TREE    = '[Generate] Tree Json data'
}


export class Upload implements Action {
  readonly type  = InvestmentActionTypes.UPLOAD;
  constructor (public payload: FormData) {}
}

export class UploadSuccess implements Action {
  readonly type = InvestmentActionTypes.UPLOAD_SUCCESS;
  constructor(public payload: any) {}
}

export class UploadFail implements Action {
  readonly type = InvestmentActionTypes.UPLOAD_FAIL;
  constructor(public payload: any) {}
}

export class GenerateTree implements Action {
  readonly type = InvestmentActionTypes.GENERATE_TREE;
  constructor(public payload: any) {}
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type InvestmentActions = | Upload | UploadSuccess | UploadFail | GenerateTree;
