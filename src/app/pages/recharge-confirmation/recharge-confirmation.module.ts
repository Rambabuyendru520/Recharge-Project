import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RechargeConfirmationComponent } from './recharge-confirmation.component';
import { RoutingModule } from './recharge-confirmation.routing';
import { HttpModule } from '@angular/http';
import { ThemeModule } from '../../theme/theme.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../reducers';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    RoutingModule,
    ThemeModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    StoreModule.forFeature('recharge', reducers)
  ],
  declarations: [ RechargeConfirmationComponent ]
})
export class RechargeConfirmationModule { }
