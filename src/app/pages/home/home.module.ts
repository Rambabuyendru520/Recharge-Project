import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RoutingModule } from './home.routing';
import { HttpModule } from '@angular/http';
import { ThemeModule } from '../../theme/theme.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../reducers';
import { SocialBundlesComponent } from './social-bundles/social-bundles.component';
import { DataBundlesComponent } from './data-bundles/data-bundles.component';
import { AirtimeBundlesComponent } from './airtime-bundles/airtime-bundles.component';
import { SMSBundlesComponent } from './sms-bundles/sms-bundles.component';
import { VoiceBundlesComponent } from './voice-bundles/voice-bundles.component';
import { SpecialBundlesComponent } from './special-bundles/special-bundles.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FibreBundlesComponent } from './fibre-bundles/fibre-bundles.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    RoutingModule,
    ThemeModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    StoreModule.forFeature('login', reducers)
  ],
  declarations: [ HomeComponent, DataBundlesComponent, AirtimeBundlesComponent, SMSBundlesComponent,
                  SocialBundlesComponent, SpecialBundlesComponent, VoiceBundlesComponent, FibreBundlesComponent ]
})
export class HomeModule { }
