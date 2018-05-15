/**
 * Created by sajibsarkar on 5/10/18.
 */


import {ServiceFileEditActions, ServiceFileEditActionTypes} from '../actions/service-file.actions';
import {FileItem} from 'ng2-file-upload';
import {AppConstant} from '../../app-constant';
import * as _ from 'lodash';

export interface SheetNameTypes { name: string;
  isAvailable: boolean;
}

export interface State {
  inputFiles: FileItem[];
  error: any;
  convertedFile: FileItem[];
  serviceFilePropertyMap: Object;
  availableSheetNames: SheetNameTypes[];
}


const initialState: State = {
  inputFiles: [],
  error: false,
  convertedFile: [],
  serviceFilePropertyMap: {},
  availableSheetNames: buildAvailableServiceTabs()
};



export function reducer (state:  State = initialState, action: ServiceFileEditActions) {

  switch (action.type) {
    case ServiceFileEditActionTypes.PROCESS:  {
      return  {
        ...state,
        inputFiles:  action.payload.files
      };
    }


    case ServiceFileEditActionTypes.CONVERT_SUCCESS:  {
      return  {
        ...state,
        convertedFile:  action.payload.files,
        serviceFilePropertyMap: action.payload.serviceFilePropertyMap
      };
    }


    case ServiceFileEditActionTypes.CONVERT_FAIL:  {
      return  {
        ...state,
        error:  action.payload
      };
    }

    case ServiceFileEditActionTypes.CLEAR_SERVICE_FILE_PROPERTY_MAP : {
      return  {
        ...state,
        serviceFilePropertyMap:  {}
      };
    }

    case ServiceFileEditActionTypes.UPDATE_ALL_SHEET_NAMES:  {
      const sheetNames = action.payload;
      const { availableSheetNames } = state;
      let newAvailableSheetNames = _.cloneDeep(availableSheetNames);
      newAvailableSheetNames = newAvailableSheetNames.map(function (keyObject) {
        keyObject.isAvailable = sheetNames.indexOf(keyObject.name) > -1 ? true : false;
        return  keyObject;
      });

      return  {
        ...state,
       availableSheetNames: newAvailableSheetNames
      };

    }

  }

  return  state;
}

function buildAvailableServiceTabs (): SheetNameTypes[] {
  return _.cloneDeep(AppConstant.SHEET_NAME_OPTIONS).reduce(function(
    memo,
    current
    ) {
      memo.push({
        name: current,
        isAvailable: false
      });
      return memo;
    },
    []);
}


export const getInputFileSelectors             = state => state.inputFiles;
export const getFailedSelectors                = state => state.error;
export const getConvertedFileSuccessSelectors  = state => state.convertedFile;
export const getAvailableSheetNameSelectors    = state => state.availableSheetNames;
export const getServicePropertyDataMapSelector = state => state.serviceFilePropertyMap;
