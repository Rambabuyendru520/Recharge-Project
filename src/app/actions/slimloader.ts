import { Action } from '@ngrx/store';

export const START_SLIMLOADER = '[Slimloader] Start_Slimloader';
export const STOP_SLIMLOADER = '[Slimloader] Stop_Slimloader';

export class StartSlimloaderAction implements Action {
  readonly  type = START_SLIMLOADER;
}
export class StopSlimloaderAction implements Action {
  readonly type = STOP_SLIMLOADER;
}

export type Actions
  = StartSlimloaderAction
  | StopSlimloaderAction;
