import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


import {
  FileUploadModule
} from 'ng2-file-upload';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TinySpinnerComponent } from './tiny-spinner/tiny-spinner.component';
import { ModalService } from './services/modal.service';
import { XlsxParserHelperService } from './helpers/xlsx-parser-helper.service';
import { XlsxImportEditorComponent } from './components/xlsx-import-editor/xlsx-import-editor.component';
import { SheetNameEditorComponent } from './components/sheet-name-editor/sheet-name-editor.component';
import { HttpClientModule } from '@angular/common/http';
import { InvestmentTreeHelperService } from './helpers/investment-tree-helper.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { routes } from './routes';
import {InvestmentService} from './services/investment.service';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './store/reducers';
import * as  investmentEffects from './store/effects/investment.effects';
import * as  loanFileEffects from './store/effects/loanfile.effects';
import * as  lperFileEffects from './store/effects/lperFile.effects';
import * as  serviceFileEffects from './store/effects/service-file.effects';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    TinySpinnerComponent,
    XlsxImportEditorComponent,
    SheetNameEditorComponent
  ],
  imports: [CommonModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, {}),
    FileUploadModule,
    FormsModule,
    TreeModule,
    NgbModule.forRoot(),
    StoreModule.forRoot(reducers , { metaReducers }),
    EffectsModule.forRoot([ investmentEffects.InvestmentEffects, loanFileEffects.LoanfileEffects, serviceFileEffects.ServiceFileEffects, lperFileEffects.LperFileEffects]),
    ToastrModule.forRoot(),
    StoreDevtoolsModule.instrument({
      name: 'Ipr  To Json  Store DevTools',
      logOnly: true
    })
  ],
  providers: [ModalService, InvestmentTreeHelperService, InvestmentService, XlsxParserHelperService],
  entryComponents: [ XlsxImportEditorComponent, SheetNameEditorComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
