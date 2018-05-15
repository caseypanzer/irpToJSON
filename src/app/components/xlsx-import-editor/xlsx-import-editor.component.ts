import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FileLikeObject} from 'ng2-file-upload';
import {AppConstant} from '../../app-constant';
import * as XLSX from 'xlsx';
import {WorkBook} from 'xlsx';
import { Workbook } from '../../types/workbook';
import {ToastrService} from 'ngx-toastr';
import {XlsxParserHelperService} from '../../helpers/xlsx-parser-helper.service';


@Component({
  selector: 'app-xlsx-import-editor',
  templateUrl: './xlsx-import-editor.component.html',
  styleUrls: ['./xlsx-import-editor.component.css']
})
export class XlsxImportEditorComponent implements OnInit {
  @Input() params: any;
  activeModal: NgbActiveModal;
  file: FileLikeObject;
  isLoanFile: boolean;
  htmlTables = [];
  workbook: WorkBook;
  sheetNameOptions: string[];
  sheetNameAlias = {};
  isProcessing: false;
  toastr: ToastrService;
  xlsxParserHelperService: XlsxParserHelperService;


  constructor(activeModal: NgbActiveModal, toastr: ToastrService, xlsxParserHelperService: XlsxParserHelperService) {
    this.sheetNameOptions = AppConstant.SHEET_NAME_OPTIONS;
    this.activeModal = activeModal;
    this.toastr = toastr;
    this.xlsxParserHelperService = xlsxParserHelperService;
  }

  ngOnInit() {
    if (this.params &&  this.params.file) {
      this.file = this.params.file;
      this.isLoanFile = this.params.isLoanFile;
      this.startProcessFile(this.file);
    }
  }

   submit() {
    const self = this;
    if (Array.isArray(this.htmlTables)) {
      const inValidSheetName = this.htmlTables.find(function(sheetName) {
        return typeof sheetName === 'undefined' || sheetName === 'Sheet1' || sheetName === null || sheetName === '';
      });

      if (inValidSheetName) {
        return this.toastr.error('Not a valid sheet name. Please choose appropriate sheet name.');
      }

      const wb = new Workbook();
      self.workbook.SheetNames.forEach(function(sheetName, index) {
        const aliasName = self.sheetNameAlias[sheetName] || `Sheet${index}`;
        wb.SheetNames.push(aliasName);
        wb.Sheets[aliasName] =  self.workbook.Sheets[sheetName];
      });

      const { modifiedFileName, modifiedFile } = this.xlsxParserHelperService.makeXlsxFile(wb, self.file);
      this.file = new FileLikeObject(modifiedFile);
      this.file.name  =  modifiedFileName + '.xlsx';
    }
    this.activeModal.close({file: this.file});
  }

  startProcessFile(file) {
    this.xlsxParserHelperService.processFile(file).then((result: any) => {
      const { workbook, sheetNameAlias } = result;
      this.workbook = workbook;
      this.sheetNameAlias = sheetNameAlias;
      if (this.isLoanFile === true) {
        this.submit();
      }
    }).catch(err => this.toastr.error(err.message));
  }


  handleSheetNameChanged (oldsheetName: string, newSheetName:  string) {
    const self = this;
    if (newSheetName) {
      if (this.workbook && Array.isArray(this.workbook.SheetNames)) {
        if (this.workbook.SheetNames.findIndex(item => item === newSheetName) > -1) {
          this.toastr.error(`${newSheetName} already exists. Please choose another name`);
          self.sheetNameAlias[oldsheetName] = oldsheetName;
        }
      }
    }
    return false;
  }

}
