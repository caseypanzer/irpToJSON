/**
 * Created by sajibsarkar on 5/9/18.
 */

import {LoanFileEditActions, LoanFileEditActionTypes} from '../actions/loan-file-edit.actions';
import {FileItem} from 'ng2-file-upload';


export interface State {
  inputFiles: FileItem[];
  error: any;
  convertedFile: FileItem[];
}


const inititalState: State = {
  inputFiles: [],
  error: false,
  convertedFile: []
};



export function reducer (state:  State = inititalState, action: LoanFileEditActions) {

  switch (action.type) {
    case LoanFileEditActionTypes.PROCESS:  {
      return  {
        ...state,
        inputFiles:  action.payload
      };

    }
    case LoanFileEditActionTypes.CONVERT_SUCCESS:  {
      return  {
        ...state,
        convertedFile:  action.payload
      };

    }
    case LoanFileEditActionTypes.CONVERT_FAIL:  {
      return  {
        ...state,
        error:  action.payload
      };
    }

  }

  return  state;
}




export const getInputFileSelectors = state => state.inputFiles;
export const getFailedSelectors = state => state.error;
export const getConvertedFileSuccessSelectors = state => state.convertedFile;
