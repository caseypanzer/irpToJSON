/**
 * Created by sajibsarkar on 5/10/18.
 */


import { Action } from '@ngrx/store';
import {FileItem} from 'ng2-file-upload';


export enum ServiceFileEditActionTypes  {
  PROCESS                = '[PROCESS] Service Files',
  CONVERT_SUCCESS        = '[CONVERT_SUCCESS] Service Files Conversion',
  CONVERT_FAIL           = '[CONVERT_FAIL] Service Files Conversion Fail',
  UPDATE_ALL_SHEET_NAMES = '[UPDATE_SHEET_NAME] Service Files SHEET NAME Update',
  CLEAR_SERVICE_FILE_PROPERTY_MAP = '[CLEAR] Service File Property Map'
}



export  class Process implements Action {
  readonly type = ServiceFileEditActionTypes.PROCESS;
  constructor(public payload: {files: FileItem[], serviceFilePropertyMap: {}}) {}
}


export  class ConvertSuccess implements Action {
  readonly type = ServiceFileEditActionTypes.CONVERT_SUCCESS;
  constructor(public payload: {files: FileItem[], serviceFilePropertyMap: {}}) {}
}


export  class ConvertFail implements Action {
  readonly type = ServiceFileEditActionTypes.CONVERT_FAIL;
  constructor(public payload: any) {}
}

export  class UpdateAllSheetNames implements Action {
  readonly type = ServiceFileEditActionTypes.UPDATE_ALL_SHEET_NAMES;
  constructor(public payload: string[]) {}
}

export class ClearServiceFilePropertyMap implements Action {
  readonly type = ServiceFileEditActionTypes.CLEAR_SERVICE_FILE_PROPERTY_MAP;
  constructor(public payload: {}) {}

}


export  type ServiceFileEditActions  =  Process | ConvertFail | ConvertSuccess| UpdateAllSheetNames | ClearServiceFilePropertyMap;
