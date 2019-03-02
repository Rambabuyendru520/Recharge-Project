import * as slimloader from '../actions/slimloader';

export interface State {
  hideLoader: boolean;
}

export const intialState = {
  hideLoader: true
};

export function reducer(state = intialState, action: slimloader.Actions) {
  switch (action.type) {
    case slimloader.START_SLIMLOADER:
      return {
        hideLoader: false
      };
    case slimloader.STOP_SLIMLOADER:
      return {
        hideLoader: true
      };
    default:
      return state;
  }
}

export const getShowSlimloader = (state: State) => state.hideLoader;
