/**
 * Created by sajibsarkar on 5/9/18.
 */

import { Action } from '@ngrx/store';
import {FileItem} from 'ng2-file-upload';


export enum LoanFileEditActionTypes  {
  PROCESS           = '[PROCESS] Loan Files',
  CONVERT_SUCCESS   = '[CONVERT_SUCCESS] Loan Files Conversion',
  CONVERT_FAIL      = '[CONVERT_FAIL] Loan Files Conversion Fail'
}



export  class Process implements Action {
  readonly type = LoanFileEditActionTypes.PROCESS;

  constructor(public payload: FileItem[]) {}
}


export  class ConvertSuccess implements Action {
  readonly type = LoanFileEditActionTypes.CONVERT_SUCCESS;

  constructor(public payload: any) {}
}



export  class ConvertFail implements Action {
  readonly type = LoanFileEditActionTypes.CONVERT_FAIL;
  constructor(public payload: any) {}
}


export  type LoanFileEditActions  =  Process | ConvertFail | ConvertSuccess;
