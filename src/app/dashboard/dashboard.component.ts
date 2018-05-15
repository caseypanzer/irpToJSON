'use strict';

import { Component, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable} from 'rxjs';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { InvestmentService } from '../services/investment.service';
import * as moment from 'moment';
import { select, Store } from '@ngrx/store';
import * as reducers from '../store/reducers';
import { InvestmentActionTypes} from '../store/actions/investment.actions';
import { LoanFileEditActionTypes } from '../store/actions/loan-file-edit.actions';
import { LperFileEditActionTypes} from '../store/actions/lper-file-edit.actions';
import { ServiceFileEditActionTypes } from '../store/actions/service-file.actions';
import { map, tap } from 'rxjs/internal/operators';
import { FileUploader } from 'ng2-file-upload';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
@Injectable()
export class DashboardComponent implements OnInit {
  serviceFileuploader: FileUploader;
  loanFileuploader: FileUploader;
  lperFileuploader: FileUploader;
  isLoanFileOver: boolean;
  isLperFileOver: boolean;
  isServiceFileOver: boolean;
  serviceFilePropertyMap = {};
  errorMsgLog: string;
  showErrorMsgLog: boolean;
  submittingFiles: boolean;
  treeJsonData$: Observable<any[]>;
  treeOptions: {};
  processingFile$: Observable<boolean>;
  processCompleted$: Observable<Object>;
  processError$: Observable<Object>;
  totalNumberOfInvestment$: Observable<number>;
  totalNumberOfAsset$: Observable<number>;
  loanFilesConverted$: Observable<any>;
  lperFilesConverted$: Observable<any>;
  serviceFilesConverted$: Observable<any>;
  serviceFilesAllSheetName$: Observable<any>;
  investmentData$: Observable<any>;



  constructor(private toastr: ToastrService, private investmentService: InvestmentService, private store: Store<reducers.AppState>) {

    this.serviceFileuploader         = new FileUploader({});
    this.loanFileuploader            = new FileUploader({});
    this.lperFileuploader            = new FileUploader({});
    this.processingFile$             = this.store.pipe(select(reducers.stateSelectors.investmentFileUpload.getProcessingSelector));
    this.processCompleted$           = this.store.pipe(select(reducers.stateSelectors.investmentFileUpload.getCompletedResultSelector));
    this.processError$               = this.store.pipe(select(reducers.stateSelectors.investmentFileUpload.getProcessingError));
    this.totalNumberOfInvestment$    = this.store.pipe(select(reducers.stateSelectors.investmentFileUpload.getTotalNumberOfInvestment));
    this.totalNumberOfAsset$         = this.store.pipe(select(reducers.stateSelectors.investmentFileUpload.getTotalNumberOfAsset));
    this.loanFilesConverted$         = this.store.pipe(select(reducers.stateSelectors.loanFileEditor.getLoanFileProcessSuccessState));
    this.lperFilesConverted$         = this.store.pipe(select(reducers.stateSelectors.lperFileEditor.getLperFileProcessSuccessState));
    this.serviceFilesConverted$      = this.store.pipe(select(reducers.stateSelectors.serviceFileEditor.getServiceFileProcessSuccessState));
    this.serviceFilesAllSheetName$   = this.store.pipe(select(reducers.stateSelectors.serviceFileEditor.getAvailableSheetNameState));
    this.treeJsonData$               = this.store.pipe(select(reducers.stateSelectors.investmentFileUpload.getTreeState), map(state => _.cloneDeep(state)));
    this.investmentData$             =  this.store.pipe(select(reducers.stateSelectors.investmentFileUpload.getInvestmentData));
  }


  /***
   * Handle the onInitialize event of this componetns
   */
  ngOnInit() {

    const self  = this;
    this.processError$.subscribe((state: any) => {
      if (state && state.message) {
        self.toastr.success(state.message);
      }
    });

    this.processCompleted$.subscribe(data => {
      if (data) {
        self.onAfterUploadSuccess(data);
      }
    });

    this.loanFilesConverted$.subscribe(convertedFiles => {
      this.loanFileuploader.clearQueue();
      this.loanFileuploader.addToQueue(convertedFiles.map(item => new File([item.rawFile], item.name)));
    });

    this.lperFilesConverted$.subscribe(convertedFiles => {
      this.lperFileuploader.clearQueue();
      this.lperFileuploader.addToQueue(convertedFiles.map(item => new File([item.rawFile], item.name)));
    });

    this.serviceFilesConverted$.subscribe(files => {
      this.serviceFileuploader.clearQueue();
      if (files && files.length > 0) {
        this.serviceFileuploader.addToQueue(files.map(item => new File([item.rawFile], item.name)));
      }
    });
  }


  /***
   * After  Success Show Sucessfull msg and Bind  the error data
   * @param res
   */
  onAfterUploadSuccess (res) {
    const self = this;
    self.submittingFiles = false;
    self.toastr.success('Files Data has been parsed successfully');
    this.handleErrorData(res);
  }

  /***
   * Bind the Error data  at the error container
   * @param res
   */
  private handleErrorData(res) {
    const self = this;
    const errors = res['errors'];
    if (errors && errors.length > 0) {
      const inputArr = [];
      const errorGroupByType = _.groupBy(errors, 'type');
      _.sortBy(Object.keys(errorGroupByType)).forEach(function (keyName) {
        if (inputArr.length > 0) {
          inputArr.push(` `);
        }
        inputArr.push(` Error type ${keyName} `);
        inputArr.push(` `);
        errorGroupByType[keyName].forEach(function (log) {
          inputArr.push(log.message);
        });
      });

      if (inputArr.length > 0) {
        self.errorMsgLog = inputArr.join('\n');
      }
    }
  }


  /***
   * Upload the  Files to analyze investment data
   */
  uploadFiles () {
    const self = this;
    self.submittingFiles = true;

    const formData = new FormData();
    let loanSetupDataExists = false;
    let serviceFileDataExists = false;
    this.loanFileuploader.queue.map(function (item) {
      loanSetupDataExists = true;
      formData.append('loanFile', item.file.rawFile['rawFile'] || item.file.rawFile , item.file.name);
    });

    this.serviceFileuploader.queue.map(function (item) {
      serviceFileDataExists = true;
      formData.append('serviceFile', item.file.rawFile['rawFile'] || item.file.rawFile, item.file.name);
    });

    this.lperFileuploader.queue.map(function (item) {
      formData.append('lperFile', item.file.rawFile['rawFile'] || item.file.rawFile, item.file.name);
    });

    if (!loanSetupDataExists && !serviceFileDataExists) {
      this.toastr.error('You need to select at least loan  setup file and service files.');
    } else {
      this.store.dispatch({ type: InvestmentActionTypes.UPLOAD, payload: formData });
    }
  }

  /***
   * Check file type and convert to xlsx if require
   */
  processServiceFiles(): void {
    const files = this.serviceFileuploader.queue.map(item => _.cloneDeep(item));
    this.store.dispatch({ type: ServiceFileEditActionTypes.PROCESS, payload: {files, serviceFilePropertyMap: this.serviceFilePropertyMap} });
  }

  /***
   * Download the Investment data as json
   */
  downloadJson () {
    this.investmentData$.pipe(
      tap()
    ).subscribe((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const firstInvestment: any = _.head(data);
        const file = new Blob([JSON.stringify(data, null, 4)], {
          type: 'application/json'
        });
        const _propertyFile = this.serviceFileuploader.queue.find(item => /_property/i.test(item.file.name));
        let downloadableFileName;

        if (firstInvestment  &&  firstInvestment.transactionId) {
          downloadableFileName = firstInvestment.transactionId + '_' + moment().format('MMDDhmmsss') + '.json';

        } else  if (_propertyFile && _propertyFile.file.name) {
          downloadableFileName = _propertyFile.file.name.substring(0, _propertyFile.file.name.lastIndexOf('.')) + '_' +  moment().format('MMDDhmmss') + '.json';
        }
        FileSaver.saveAs(file, downloadableFileName);
      }
    });
  }


  /***
   * Check file type and convert to xlsx if require
   */
  adjustLoanFiles() {
    const files = this.loanFileuploader.queue.map(item => _.cloneDeep(item));
    this.store.dispatch({ type: LoanFileEditActionTypes.PROCESS, payload: files});
  }

  /***
   * Check file type and convert to xlsx if require
   */
  adjustLperFiles() {
    const files = this.lperFileuploader.queue.map(item => _.cloneDeep(item));
    this.store.dispatch({ type: LperFileEditActionTypes.PROCESS, payload: files});
  }


  onLoanFileSelect() {
    this.adjustLoanFiles();
  }

  onServiceFileSelect() {
    this.processServiceFiles();
  }

  onLperFileSelect() {
    this.adjustLperFiles();
  }
}
