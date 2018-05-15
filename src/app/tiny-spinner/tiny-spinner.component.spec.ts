import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TinySpinnerComponent } from './tiny-spinner.component';

describe('TinySpinnerComponent', () => {
  let component: TinySpinnerComponent;
  let fixture: ComponentFixture<TinySpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TinySpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TinySpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
