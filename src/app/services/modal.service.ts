import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';
import { XlsxImportEditorComponent } from './../components/xlsx-import-editor/xlsx-import-editor.component';
import {SheetNameEditorComponent} from '../components/sheet-name-editor/sheet-name-editor.component';


@Injectable()
export class ModalService {

  constructor(private modalService: NgbModal) {
    this.modalService = modalService;
  }

  async showModal(compName: string, params: any = {}) {
    let refComp;
    switch (compName) {
      case 'xlsxImportEditor':
        params.size = 'lg';
        refComp = XlsxImportEditorComponent;
        break;
      case 'sheetNameEditor':
        params.size = 'lg';
        refComp = SheetNameEditorComponent;
        break;
    }

    if (refComp) {
      const modalRef = this.modalService.open(refComp, params);
      if (params) {
        modalRef.componentInstance.params = params;
      }
      return  await modalRef.result;
    } else {
      return Promise.reject(new Error('component  not found'));
    }
  }
}
