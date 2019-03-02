import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import 'angular2-navigate-with-data';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './core/app.component';
import { PluginsModule } from './plugins/plugins.module';
import { ThemeModule } from './theme/theme.module';
import { PagesModule } from './pages/pages.module';

import { RoutingModule } from './core/app.routing';

import { reducer, reducers } from './reducers';
import { StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SlimLoadingBarModule.forRoot(),
    ReactiveFormsModule, FormsModule,
    RoutingModule,
    PagesModule,
    PluginsModule.forRoot(),
    ThemeModule.forRoot(),
    HttpModule,
    StoreModule.forRoot(reducers),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
