import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { XlsxImportEditorComponent } from '../xlsx-import-editor/xlsx-import-editor.component';
import {ToastrService} from 'ngx-toastr';
import {XlsxParserHelperService} from '../../helpers/xlsx-parser-helper.service';

@Component({
  selector: 'app-sheet-name-editor',
  templateUrl: './sheet-name-editor.component.html',
  styleUrls: ['./sheet-name-editor.component.css']
})
export class SheetNameEditorComponent extends XlsxImportEditorComponent {

  constructor(activeModal: NgbActiveModal, toastr: ToastrService, xlsxParserHelperService: XlsxParserHelperService) {
    super(activeModal, toastr, xlsxParserHelperService);
  }
}
