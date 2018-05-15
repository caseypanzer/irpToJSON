/**
 * Created by sajibsarkar on 5/10/18.
 */


import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { LperFileEditActionTypes, ConvertSuccess, ConvertFail, Process, LperFileEditActions } from '../actions/lper-file-edit.actions';
import * as async from 'async';

import {
  catchError,
  map,
  switchMap,
} from 'rxjs/operators';

import { Observable } from 'rxjs';
import {ModalService} from '../../services/modal.service';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';


@Injectable()
export class LperFileEffects {
  modalService$: ModalService;
  @Effect()
  proess$: Observable<Action> = this.actions$.pipe(
    ofType<Process>(LperFileEditActionTypes.PROCESS),
    map(action  => action.payload),
    switchMap(files => {
      const self = this;
      return fromPromise(processFiles(files, self.modalService$).then((fileItems) => {
        return new ConvertSuccess(fileItems);
      }).catch(err => {
          return new ConvertFail(err);
      }));
    }));


  constructor (private actions$: Actions, modalService$: ModalService) {
    this.modalService$ = modalService$;
  }
}


function processFiles(files, modalService) {
  return new Promise(function (resolve, reject) {
    async.mapSeries(
      files,
      async function (item, next) {
        const file = item.file;
        if (/\.txt$/i.test(file.name) || /\.csv/i.test(file.name)) {
          try {
            const result = await modalService.showModal(
              'xlsxImportEditor',
              {file: file, isLoanFile: true}
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
        } else {
          next(null, file);
        }
      },
      function (err, fileItems: any) {
        resolve(fileItems);
      });
  });
}
