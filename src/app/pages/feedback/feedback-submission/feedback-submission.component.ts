import { Component, OnInit, ViewEncapsulation, AfterContentChecked, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { config } from '../../../config';
import { Router } from '@angular/router';
import { FeedbackService } from '../../../plugins/feedback';
import { FeedbackForm } from '../../../utils/interface/feedback';
import * as fromRoot from '../../../reducers';
import * as loader from '../../../actions/slimloader';
import { Store } from '@ngrx/store';
import { PreloaderService } from '../../../theme/services';
import { AngularCDRService } from '../../../plugins/angularCDR';

@Component({
  selector: 'com-feedback-submission',
  templateUrl: './feedback-submission.component.html',
  styleUrls: ['./feedback-submission.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeedbackSubmissionComponent implements OnInit, AfterContentChecked, AfterViewInit {
  ASSETS_PATH: any = config.ASSETS;
  feedbackForm: FormGroup;
  feedbackContent: any= '';
  feedbackLen = 0;
  header_text: any;
  order_obj: any;
  order_no: any;
  startTime: any;
  category: any = 'Feedback';
  constructor(private fb: FormBuilder, private _router: Router, private _feedback: FeedbackService,
    private _store: Store<fromRoot.State>, private _loader: PreloaderService, private _cdr: AngularCDRService) {
  }
  ngOnInit() {
    this.startTime = this._cdr.getTransactionTime(0);
    this._loader.show();
    this.order_obj = sessionStorage.getItem('order');
    console.log('Order - ' + JSON.stringify(this.order_obj));
    this.order_obj = JSON.parse(this.order_obj);
    if (!this.order_obj) {
      window.location.href = '/recharge';
    } else {
      this.order_no = this.order_obj.order_no;
      sessionStorage.removeItem('mnbvcxzlkjhgfdsa');
    }
    this.header_text = 'Thanks, that\'s it';
    this.feedbackForm = this.fb.group({
      feedback: ['', [Validators.required]],
      formRating: ['', [Validators.required]]
    });
  }
  ngAfterViewInit() {
    this._cdr.writeCDR(this.startTime, this.category, 'Start');
  }
  ngAfterContentChecked(): void {
    this._loader.hide(1000);
  }
  onKey() {
    this.feedbackLen = this.feedbackContent.length;
  }
  submitReview({value, valid}: {value: FeedbackForm, valid: boolean}) {
      const rating = value.formRating.toString();
      const feedback = value.feedback.toString();
      this._store.dispatch(new loader.StartSlimloaderAction);
      this._cdr.writeCDR(this.startTime, this.category, 'Submitted to FrontEnd');
      this._feedback.sendFeedback(rating, feedback, this.order_obj.order_no, this.order_obj.vas_code, this.order_obj.facing_name)
      .then(response => {
        this._cdr.writeCDR(this.startTime, this.category, 'Feedback Sent Success');
        sessionStorage.removeItem('mnbvcxzlkjhgfdsa');
        this._store.dispatch(new loader.StopSlimloaderAction);
        this._router.navigate(['recharge', 'feedback', 'success']).then(() =>
          this._cdr.writeCDR(this.startTime, this.category, 'Redirection Success')
        ).catch(() => this._cdr.writeCDR(this.startTime, this.category, 'Redirection Success') );
      })
      .catch(err => {
        this._cdr.writeCDR(this.startTime, this.category, 'Feedback Sent Failure');
        this._store.dispatch(new loader.StopSlimloaderAction);
        this._router.navigate(['recharge', 'error', 'feedback']);
      });
  }
  backButtonRedirection() {
    this._router.navigate(['recharge']);
    this._cdr.writeCDR(this.startTime, this.category, 'Back to Home Page from Feedback');
  }
  logoClick() {
    window.location.href = '/recharge/';
  }
}
