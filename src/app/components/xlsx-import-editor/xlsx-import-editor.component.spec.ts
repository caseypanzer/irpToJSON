import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlsxImportEditorComponent } from './xlsx-import-editor.component';

describe('XlsxImportEditorComponent', () => {
  let component: XlsxImportEditorComponent;
  let fixture: ComponentFixture<XlsxImportEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlsxImportEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlsxImportEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
