import { TimerBase } from '../timers/timer-base.class';
import { TimerType } from '../timers/timer-type.enum';

export class GitlabTimer extends TimerBase {
  timerType = TimerType.GITLAB;
  public icon = 'fab fa-gitlab';

  constructor(timer: any) {
    super(timer);
    this.sync(timer);
  }

  sync(timer: any) {
    this.details = timer.details || timer;
    this.webUrl = this.details.web_url;
    super.sync(timer);
  }
}
