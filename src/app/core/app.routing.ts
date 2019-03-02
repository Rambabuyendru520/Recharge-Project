import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { PageNotFoundComponent } from '../pages/page-not-found';
const routes: Routes = [
  { path: 'recharge', redirectTo: 'recharge', pathMatch: 'full'},
  { path: 'pagenotfound', pathMatch: 'full', component: PageNotFoundComponent },
  { path: '**', redirectTo: 'recharge', pathMatch: 'full'}
];

export const RoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);

