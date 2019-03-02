import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule} from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../reducers';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { BarRatingModule } from 'ngx-bar-rating';
import {
  MatInputModule,
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSidenavModule,
  MatListModule,
  MatCardModule,
  MatExpansionModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatCheckboxModule
} from '@angular/material';

import {
  ButtonComponent,
  InputComponent,
  HeaderComponent,
  SlimloaderComponent,
  BundleIconComponent,
  BundleHelpIconComponent,
  BundleCardComponent,
  AirtimeInputComponent,
  FooterComponent,
  ModalComponent,
  MSISDNInputComponent,
  CheckboxComponent
} from './components';

import {
  PreloaderService,
  SlimloaderService,
  CommonService,
  HeaderBackService,
  BundleSelectionService,
  GoogleAnalyticsService
} from './services';

import {
  MSISDNPipe,
  CheckNullPipe
} from './pipes';

const MAT_MODULES = [
  MatButtonModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSidenavModule,
  MatListModule,
  MatCardModule,
  MatExpansionModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatCheckboxModule,
  BarRatingModule
];

const COM_COMPONENTS = [
  ButtonComponent,
  InputComponent,
  HeaderComponent,
  SlimloaderComponent,
  BundleIconComponent,
  BundleHelpIconComponent,
  BundleCardComponent,
  AirtimeInputComponent,
  FooterComponent,
  ModalComponent,
  MSISDNInputComponent,
  CheckboxComponent
];

const COM_DIRECTIVES = [
];

const COM_SERVICES = [
  PreloaderService,
  SlimloaderService,
  CommonService,
  HeaderBackService,
  BundleSelectionService,
  GoogleAnalyticsService
];

const COM_PIPES = [
  MSISDNPipe,
  CheckNullPipe
];

@NgModule({
  imports: [
    CommonModule,
    ...MAT_MODULES,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forFeature('theme', reducers),
    HttpClientModule,
  ],
  declarations: [...COM_COMPONENTS, ...COM_DIRECTIVES, ...COM_PIPES],
  exports: [ ...MAT_MODULES, ...COM_COMPONENTS, ...COM_DIRECTIVES, ...COM_PIPES],
  providers : [...COM_PIPES]
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: ThemeModule,
      providers: [
        CookieService,
        ...COM_SERVICES,
      ]
    };
  }
}
