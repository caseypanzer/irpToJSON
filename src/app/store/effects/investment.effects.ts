import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { GenerateTree, InvestmentActionTypes, Upload, UploadSuccess, UploadFail } from '../actions/investment.actions';

import {
  catchError,
  map,
  switchMap,
} from 'rxjs/operators';

import {InvestmentService} from '../../services/investment.service';
import { Observable } from 'rxjs';



@Injectable()
export class InvestmentEffects {
  @Effect()
  upload$: Observable<Action> = this.actions$.pipe(
    ofType<Upload>(InvestmentActionTypes.UPLOAD),
    map(action => action.payload),
    switchMap((payload) => {
      return this.investmentService.uploadFiles(payload).pipe(
        map( response => {
          return new UploadSuccess(response);
        }),
        catchError(resp => [new UploadFail(resp.error)])
      );
    })
  );
  @Effect()
  uploadSuccess$: Observable<Action> = this.actions$.pipe(
    ofType<UploadSuccess>(InvestmentActionTypes.UPLOAD_SUCCESS),
    map(action => action.payload),
    switchMap(payload => {
      return [new GenerateTree(payload)];
    }),
  );


  constructor (private actions$: Actions, private investmentService: InvestmentService ) {

  }
}
