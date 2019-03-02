import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'welcome',
        data : { some_data: '0'}
      },
      {
        path: 'data',
        data : { some_data: '1'}
      },
      {
        path: 'airtime',
        data : { some_data: '2'}
      },
      {
        path: 'sms',
        data : { some_data: '3'}
      },
      {
        path: 'fibre',
        data : { some_data: '4'}
      },
      {
        path: 'social',
        data : { some_data: '5'}
      },
      {
        path: 'specials',
        data : { some_data: '6'}
      },
      {
        path: 'voice',
        data : { some_data: '7'}
      },
      {
        path: 'help',
        data : {some_data: '8'}
      },
      {
        path: '',
        redirectTo: 'welcome',
        pathMatch: 'full'
      },
    ]
  }
];

export const RoutingModule: ModuleWithProviders = RouterModule.forChild(routes);
