import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RechargeConfirmationComponent } from './recharge-confirmation.component';
export const routes: Routes = [
  {
    path: '',
    component: RechargeConfirmationComponent
  }
];

export const RoutingModule: ModuleWithProviders = RouterModule.forChild(routes);
