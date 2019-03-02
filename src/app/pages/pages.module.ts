import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { RoutingModule } from './pages.routing';
import { HttpModule } from '@angular/http';
import { ThemeModule } from '../theme/theme.module';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../reducers';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CanActivateRouteGuard } from '../plugins/session/session.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FalloutFeedbackErrorComponent } from './fallout/fallout-feedback-error/fallout-feedback-error.component';
import { FalloutGeneralComponent } from './fallout/fallout-general/fallout-general.component';
import { FalloutNonMTNComponent } from './fallout/fallout-non-mtn/fallout-non-mtn.component';
import { FalloutPaymentUnsuccessfulComponent } from './fallout/fallout-payment-unsuccessful/fallout-payment-unsuccessful.component';
import { FalloutPurchaseLimitComponent } from './fallout/fallout-purchase-limit/fallout-purchase-limit.component';
import { FeedbackSuccessComponent } from './feedback/feedback-success/feedback-success.component';
import { FeedbackSubmissionComponent } from './feedback/feedback-submission/feedback-submission.component';
import { BarRatingModule } from 'ngx-bar-rating';
@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    RoutingModule,
    ThemeModule,
    FormsModule,
    ReactiveFormsModule,
    BarRatingModule,
    StoreModule.forFeature('pages', reducers)
  ],
  declarations: [PagesComponent, PageNotFoundComponent, FalloutFeedbackErrorComponent,
                FalloutGeneralComponent, FalloutNonMTNComponent, FalloutPaymentUnsuccessfulComponent,
                FalloutPurchaseLimitComponent, FeedbackSuccessComponent, FeedbackSubmissionComponent],
  providers: [CanActivateRouteGuard ]
})
export class PagesModule { }
