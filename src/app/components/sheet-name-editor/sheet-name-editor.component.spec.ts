import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetNameEditorComponent } from './sheet-name-editor.component';

describe('SheetNameEditorComponent', () => {
  let component: SheetNameEditorComponent;
  let fixture: ComponentFixture<SheetNameEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheetNameEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheetNameEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
