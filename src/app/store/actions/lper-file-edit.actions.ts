/**
 * Created by sajibsarkar on 5/10/18.
 */


import { Action } from '@ngrx/store';
import {FileItem} from 'ng2-file-upload';


export enum LperFileEditActionTypes  {
  PROCESS           = '[PROCESS] Lper Files',
  CONVERT_SUCCESS   = '[CONVERT_SUCCESS] Lper Files Conversion',
  CONVERT_FAIL      = '[CONVERT_FAIL] Lper Files Conversion Fail'
}



export  class Process implements Action {
  readonly type = LperFileEditActionTypes.PROCESS;
  constructor(public payload: FileItem[]) {}
}


export  class ConvertSuccess implements Action {
  readonly type = LperFileEditActionTypes.CONVERT_SUCCESS;

  constructor(public payload: any) {}
}



export  class ConvertFail implements Action {
  readonly type = LperFileEditActionTypes.CONVERT_FAIL;
  constructor(public payload: any) {}
}


export  type LperFileEditActions  =  Process | ConvertFail | ConvertSuccess;
