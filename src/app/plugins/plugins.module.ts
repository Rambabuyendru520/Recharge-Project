import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularCDRService } from './angularCDR';
import 'rxjs/add/operator/timeout';
import { PayementGatewayService } from './paymentGateway';
import { HomeService } from './home';
import { FeedbackService } from './feedback';

export const PLUGIN_SERVICE = [
  AngularCDRService,
  PayementGatewayService,
  HomeService,
  FeedbackService
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: []
})
export class PluginsModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders> {
      ngModule: PluginsModule,
      providers: [
        ...PLUGIN_SERVICE
      ]
    };
  }
}
