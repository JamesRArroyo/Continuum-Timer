import { Component, OnInit } from '@angular/core';
import { TimerService } from '../timer.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { TimerBase } from '../timer-base.class';
import { GitlabNewTimerComponent } from '../../gitlab/gitlab-new-timer/gitlab-new-timer.component';
import { CustomNewTimerComponent } from '../custom-new-timer/custom-new-timer.component';

@Component({
  selector: 'app-timer-list',
  templateUrl: './timer-list.component.html',
  styleUrls: ['./timer-list.component.scss'],
})
export class TimerListComponent implements OnInit {
  timers: TimerBase[];

  constructor(private timerService: TimerService, public dialog: MatDialog) {}

  ngOnInit() {
    this.timerService.timers.subscribe((timers: TimerBase[]) => {
      this.timers = timers.sort((t1: TimerBase, t2: TimerBase) => {
        return t2.createdDate > t1.createdDate ? 1 : -1;
      });
    });
  }

  createTimerDialog(type: string): void {
    let timerComponent;
    switch (type) {
      case 'custom':
        timerComponent = CustomNewTimerComponent;
        break;
      case 'gitlab':
        timerComponent = GitlabNewTimerComponent;
        break;
      default:
        throw new Error('Unknown Timer Type...');
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'dialog-wrapper';
    dialogConfig.autoFocus = true;

    this.dialog.open(timerComponent, dialogConfig);
  }
}
