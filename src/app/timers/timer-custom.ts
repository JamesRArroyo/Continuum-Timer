import { TimerBase } from './timer-base.class';
import { TimerType } from './timer-type.enum';

export class CustomTimer extends TimerBase {
  timerType = TimerType.CUSTOM;
  public icon = 'fas fa-stopwatch';

  constructor(public timer: any) {
    super(timer);
  }
}
