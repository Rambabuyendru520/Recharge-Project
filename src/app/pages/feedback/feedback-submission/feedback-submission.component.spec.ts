import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackSubmissionComponent } from './feedback-submission.component';
import { ThemeModule } from '../../theme/theme.module';
import { FormsModule,ReactiveFormsModule } from '../../../../node_modules/@angular/forms';
import { BarRatingModule } from '../../../../node_modules/ngx-bar-rating';
import { StoreModule } from '../../../../node_modules/@ngrx/store';
import { reducers } from '../../reducers';
import { RouterTestingModule } from '@angular/router/testing';
import { FeedbackService } from '../../plugins/feedback';
import { HttpModule } from '../../../../node_modules/@angular/http';
import { AngularCDRService } from '../../plugins/angularCDR';
import { HeaderBackService } from '../../theme/services';
import { BrowserAnimationsModule } from '../../../../node_modules/@angular/platform-browser/animations';
import { DebugElement } from '../../../../node_modules/@angular/core';
import { By } from '../../../../node_modules/@angular/platform-browser';

describe('FeedbackSubmissionComponent', () => {
  let component: FeedbackSubmissionComponent;
  let fixture: ComponentFixture<FeedbackSubmissionComponent>;
  let feedbackService: FeedbackService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackSubmissionComponent ],
      imports: [
        ThemeModule,
        FormsModule,
        ReactiveFormsModule,
        BarRatingModule,
        StoreModule.forRoot(reducers),
        RouterTestingModule,
        HttpModule,
        BrowserAnimationsModule        
      ],
      providers: [
        FeedbackService,
        AngularCDRService,
        HeaderBackService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the side-image', () => {
    let de: DebugElement = fixture.debugElement;
    let logoDe = de.query(By.css('.image'))
    let logo: HTMLElement = logoDe.nativeElement;
    expect(logo).not.toBe(null);
  });

  it('Success: should have feedback form with feedback input', () => {
    let control = component.feedbackForm.get('feedback');
    expect(control).toBeTruthy();
  });

  it('Failure: should make the feedback input control required', () => {
    let control = component.feedbackForm.get('feedback');
    control.setValue('')
    expect(control.valid).toBeFalsy();
  });

  it('Success: should make the feedback input control required', () => {
    let control = component.feedbackForm.get('feedback');
    control.setValue('feedback')
    expect(control.valid).toBeTruthy();
  });

  it('Success: should have feedback form with rating input', () => {
    let control = component.feedbackForm.get('formRating');
    expect(control).toBeTruthy();
  });
 
  it('Failure: should make the formRating input control required', () => {
    let control = component.feedbackForm.get('formRating');
    control.setValue('')
    expect(control.valid).toBeFalsy();
  });
      
  it('Success: should make the formRating input control required', () => {
    let control = component.feedbackForm.get('formRating');
    control.setValue(5)
    expect(control.valid).toBeTruthy();
  });

  it('Failure: should make the feedbackForm valid - no rating', () => {
    let controlRating = component.feedbackForm.get('formRating');
    controlRating.setValue('')
    let control = component.feedbackForm.get('feedback');
    control.setValue('feedback')
    expect(component.feedbackForm.valid).toBeFalsy();
  });
  it('Failure: should make the feedbackForm valid - no feedback', () => {
    let controlRating = component.feedbackForm.get('formRating');
    controlRating.setValue(5)
    let control = component.feedbackForm.get('feedback');
    control.setValue('')
    expect(component.feedbackForm.valid).toBeFalsy();
  });
  it('Success: should make the feedbackForm valid', () => {
    let controlRating = component.feedbackForm.get('formRating');
    controlRating.setValue(5)
    let control = component.feedbackForm.get('feedback');
    control.setValue('feedback')
    expect(component.feedbackForm.valid).toBeTruthy();
  });

  it('Success: Should call submit review on feddback form submit', () => {
    let controlRating = component.feedbackForm.get('formRating');
    controlRating.setValue(5);
    let control = component.feedbackForm.get('feedback');
    control.setValue('feedback');    
    let spy = spyOn(component, 'submitReview');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.form')).triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();
    expect(component.feedbackForm.valid).toBeTruthy();
    expect(spy).toHaveBeenCalled();
  });

  it('should call Send Feedback from Feedback Service on calling review submit', () => {
    // store = fixture.debugElement.injector.get(Store);
    feedbackService = TestBed.get(FeedbackService);
    spyOn(feedbackService, 'sendFeedback').and.returnValue(Promise.resolve());

    // loginService = TestBed.get(LoginService);
    // spyOn(loginService, 'getLoginDetails').and.returnValue(Promise.resolve({ fakeDetails: 123456879 }));

    fixture.detectChanges();

    component.submitReview(component.feedbackForm);

    expect(feedbackService.sendFeedback).toHaveBeenCalled();
  });

  it('should call Get Back Details from Feedback Service on loading page', () => {
    // store = fixture.debugElement.injector.get(Store);
    feedbackService = TestBed.get(FeedbackService);
    spyOn(feedbackService, 'getBackDetails').and.returnValue(Promise.resolve());

    // loginService = TestBed.get(LoginService);
    // spyOn(loginService, 'getLoginDetails').and.returnValue(Promise.resolve({ fakeDetails: 123456879 }));

    fixture.detectChanges();

    component.ngOnInit();

    expect(feedbackService.getBackDetails).toHaveBeenCalled();
  });

  
    
});
