/**
 * Created by sajibsarkar on 5/10/18.
 */


import { Injectable } from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ConvertSuccess, ConvertFail, Process, ServiceFileEditActionTypes, UpdateAllSheetNames } from '../actions/service-file.actions';
import * as async from 'async';
import * as _ from 'lodash';

import {
  catchError,
  map,
  switchMap,
} from 'rxjs/operators';

import { Observable,  } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import {ModalService} from '../../services/modal.service';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';
import {AppState, stateSelectors } from '../reducers';
import {XlsxParserHelperService} from '../../helpers/xlsx-parser-helper.service';


@Injectable()
export class ServiceFileEffects {
  @Effect()
  proess$: Observable<Action> = this.actions$.pipe(
    ofType<Process>(ServiceFileEditActionTypes.PROCESS),
    withLatestFrom(this.store$.pipe(select(stateSelectors.serviceFileEditor.getServicePropertyDataMapSelector))),
    map(([action, _state]) => {
      return [action.payload, _state];
    }),
    switchMap(([payload, servicePropertyDataMap]) => {
      const self = this;
      return fromPromise(processFiles(payload, _.cloneDeep(servicePropertyDataMap), self.modalService$).then((result: any) => {
        const { fileItems, serviceFilePropertyMap } = result;
        return new ConvertSuccess({files: fileItems, serviceFilePropertyMap: serviceFilePropertyMap});
      }).catch(err => {
        return new ConvertFail(err);
      }));
    }));


  @Effect()
  process_success: Observable<Action> = this.actions$.pipe(
    ofType<ConvertSuccess>(ServiceFileEditActionTypes.CONVERT_SUCCESS),
    map(action  => action.payload),
    switchMap(payload => {
      const { files } = payload;
      const  _promises = [];
      files.forEach(_fileItem => _promises.push(this.xlsxParserHelperService.getAllSheetNames(_fileItem)));
      return fromPromise(Promise.all(_promises).then(function (allSheetNames) {
        return new UpdateAllSheetNames(_.flatten(allSheetNames));
      }));
    }));


  constructor (private actions$: Actions, private modalService$: ModalService, private store$: Store<AppState>, private xlsxParserHelperService: XlsxParserHelperService) {}
}



function processFiles(payload, serviceFilePropertyMap, modalService) {
  const { files } = payload;
  return new Promise(function (resolve, reject) {
    async.mapSeries(
      files,
      async function(item, next) {
        const file = item.file;
        if (/\.txt$/i.test(file.name) || /\.csv/i.test(file.name)) {
          try {
            const result = await modalService.showModal(
              'xlsxImportEditor',
              { file: file, isLoanFile: false }
            );
            if (result && result.file) {
              next(null, result.file);
            } else {
              next(null, file);
            }
          } catch (err) {
            console.log('error ', err);
            next(null, file);
          }
        } else if (
          !serviceFilePropertyMap[file.name] ||
          (serviceFilePropertyMap[file.name] &&
            !serviceFilePropertyMap[file.name]
              .isSheetNameCheckingProcessed)
        ) {
          try {
            const result = await modalService.showModal('sheetNameEditor', { file: file });
            if (result && result.file) {
              if (!serviceFilePropertyMap[result.file.name]) {
                serviceFilePropertyMap[result.file.name] = {};
              }
              serviceFilePropertyMap[result.file.name].isSheetNameCheckingProcessed = true;
              next(null, result.file);
            }  else {
              next(null, file);
            }
          } catch (err) {
            console.log('error ', err);
            next(null, file);
          }
        } else {
          next(null, file);
        }
      },
      function(err, fileItems: any) {
        resolve({ fileItems, serviceFilePropertyMap});
      }
    );

  });
}
