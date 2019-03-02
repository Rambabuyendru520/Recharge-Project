import { ActionReducer, combineReducers } from '@ngrx/store';
import { createSelector } from 'reselect';
import * as fromRouter from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { compose } from '@ngrx/core/compose';
import * as fromLayout from './layout';
import * as fromSlimloader from './slimloader';
import { loadState } from '../core/app.state';

export interface State {
  layout: fromLayout.State;
  slimloader: fromSlimloader.State;
}

export const reducers = {
  layout: fromLayout.reducer,
  router: fromRouter.routerReducer,
  slimloader: fromSlimloader.reducer,
};

const localStorageSync = (reducer: any) => {
  return function(state, action: any) {
    if (action.type === '@ngrx/store/init') {
      state = Object.assign({}, state, loadState());
    }
    const nextState = reducer(state, action);
    return nextState;
  };
};
const developmentReducer: ActionReducer<State> = compose(localStorageSync, combineReducers)(reducers);
const productionReducer: ActionReducer<State> = compose(localStorageSync, combineReducers)(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}

/**
 * Layout Reducer
 */

export const getLayoutState = (state: State) => state.layout;

export const getShowSidenav = createSelector(getLayoutState, fromLayout.getShowSidenav);

/**
 * Slimloader Reducer
 */

export const getSlimloaderState = (state: State) => state.slimloader;

export const getShowSlimloader = createSelector(getSlimloaderState, fromSlimloader.getShowSlimloader);

