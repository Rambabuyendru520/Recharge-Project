import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { CanActivateRouteGuard } from './../plugins/session/session.service';
import { FalloutGeneralComponent } from './fallout/fallout-general/fallout-general.component';
import { FalloutPurchaseLimitComponent } from './fallout/fallout-purchase-limit/fallout-purchase-limit.component';
import { FalloutFeedbackErrorComponent } from './fallout/fallout-feedback-error/fallout-feedback-error.component';
import { FalloutNonMTNComponent } from './fallout/fallout-non-mtn/fallout-non-mtn.component';
import { FalloutPaymentUnsuccessfulComponent } from './fallout/fallout-payment-unsuccessful/fallout-payment-unsuccessful.component';
import { FeedbackSubmissionComponent } from './feedback/feedback-submission/feedback-submission.component';
import { FeedbackSuccessComponent } from './feedback/feedback-success/feedback-success.component';
import { PageNotFoundComponent } from './page-not-found';
export const routes: Routes = [
      { path: '', redirectTo: 'recharge', pathMatch: 'full' },
      {
        path: 'recharge',
        children: [
          {
            path : '',
            component: PagesComponent,
            loadChildren: './home/home.module#HomeModule'
          },
          {
            path: 'forbidden',
            component: PageNotFoundComponent
          },
          {
            path: 'confirmation',
            canActivate: [CanActivateRouteGuard],
            component: PagesComponent,
            loadChildren: './recharge-confirmation/recharge-confirmation.module#RechargeConfirmationModule'
          },
          {
            path: 'error',
            children: [
              {
                path: '',
                redirectTo: 'general',
                pathMatch: 'full'
              },
              {
                path: 'general',
                component: FalloutGeneralComponent
              },
              {
                path: 'feedback',
                component: FalloutFeedbackErrorComponent
              },
              {
                path: 'offnet',
                component: FalloutNonMTNComponent
              },
              {
                path: 'payment',
                component: FalloutPaymentUnsuccessfulComponent
              },
              {
                path: 'limit',
                component: FalloutPurchaseLimitComponent
              }
            ]
          },
          {
            path: 'feedback',
            children: [
              {
                path: '',
                pathMatch: 'full',
                component: FeedbackSubmissionComponent,
              },
              {
                path: 'success',
                component: FeedbackSuccessComponent
              }
            ]
          },
          {
            path: '**',
            redirectTo: 'welcome',
            pathMatch: 'full'
          }
        ]
      }
];
export const RoutingModule: ModuleWithProviders = RouterModule.forChild(routes);

