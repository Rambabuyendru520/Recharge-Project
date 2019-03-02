import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FalloutFeedbackErrorComponent } from './fallout-feedback-error.component';

describe('FalloutFeedbackErrorComponent', () => {
  let component: FalloutFeedbackErrorComponent;
  let fixture: ComponentFixture<FalloutFeedbackErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FalloutFeedbackErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FalloutFeedbackErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
