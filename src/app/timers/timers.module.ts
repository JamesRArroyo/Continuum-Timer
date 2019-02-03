import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerDetailComponent } from './timer-detail/timer-detail.component';
import { TimerListComponent } from './timer-list/timer-list.component';
import { TimersComponent } from './timers/timers.component';
import { TimerService } from './timer.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GitlabModule } from '../gitlab/gitlab.module';
import { GitlabNewTimerComponent } from '../gitlab/gitlab-new-timer/gitlab-new-timer.component';
import { CustomNewTimerComponent } from './custom-new-timer/custom-new-timer.component';
import { TimerBottomSheetComponent } from './timer-bottom-sheet/timer-bottom-sheet.component';
import { SharedModule } from '../shared/shared.module';
import { TimeEntryEditComponent } from './time-entry-edit/time-entry-edit.component';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
  OWL_DATE_TIME_FORMATS,
} from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MOMENT_DATETIME_FORMATS = {
  parseInput: 'l LTS',
  fullPickerInput: 'l LTS',
  datePickerInput: 'l',
  timePickerInput: 'LTS',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GitlabModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
  ],
  declarations: [
    TimerDetailComponent,
    TimerListComponent,
    TimersComponent,
    CustomNewTimerComponent,
    TimerBottomSheetComponent,
    TimeEntryEditComponent,
  ],
  exports: [TimerDetailComponent, TimerListComponent, TimersComponent],
  providers: [
    TimerService,
    { provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_DATETIME_FORMATS },
  ],
  entryComponents: [
    GitlabNewTimerComponent,
    CustomNewTimerComponent,
    TimerBottomSheetComponent,
    TimeEntryEditComponent,
  ],
})
export class TimersModule {}
