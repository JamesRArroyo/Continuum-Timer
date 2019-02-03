import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TimeEntry, TimerBase } from '../../timers/timer-base.class';
import { FirestoreWhere, TimerService } from '../../timers/timer.service';
import { TimeEntryService } from '../../timers/time-entry.service';
import { combineLatest, Observable } from 'rxjs';
import * as moment from 'moment';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/users.interface';
import { ReportsService, Filter } from '../reports.service';

interface TimeByUser {
  user: User;
  totalTime: number;
  entries?: TimeEntry[];
  activeTimer: boolean;
}

interface TimeByDay {
  day: string;
  timeByUser: TimeByUser[];
}

@Component({
  selector: 'app-activity-report',
  templateUrl: './activity-report.component.html',
  styleUrls: ['./activity-report.component.scss'],
})
export class ActivityReportComponent implements OnInit {
  loading: boolean = false;
  timersMap: any = {};
  timeByUser: TimeByUser[] = [];
  timeByDay: TimeByDay[] = [];
  filters: Filter = {
    startDate: new Date(),
    endDate: new Date(),
  };

  constructor(
    private timerService: TimerService,
    private timeEntryService: TimeEntryService,
    private userService: UsersService,
    private reportsService: ReportsService,
  ) {}

  ngOnInit() {}

  /**
   * Calls functions to generate data for the report
   */
  generateReport(filter: Filter) {
    this.filters.startDate = filter.startDate;
    this.filters.endDate = filter.endDate;
    this.reportsService.setFilter(filter);
    this.resetReport();

    this.loading = true;
    this.getTimeEntries(filter.startDate, filter.endDate).then((entries: TimeEntry[]) => {
      this.loading = false;
      let timerIds = [];
      timerIds = [...new Set(entries.map(e => e.timerId))];
      this.createTimerMap(timerIds).subscribe(() => {
        this.groupTimeByUser(entries).then((timeByUser: TimeByUser[]) => {
          this.timeByUser = timeByUser;
          this.watchRunningTimers();
        });
        this.groupTimeByDay(entries);
      });
    });
  }

  /**
   * Gets time entries using criteria provided.
   * @param {Date} start - The start date.
   * @param {Date} end  - The end date.
   */
  getTimeEntries(start: Date, end: Date): Promise<TimeEntry[]> {
    const whereQuery: FirestoreWhere[] = [
      { key: 'startTime', operator: '>=', value: start },
      { key: 'startTime', operator: '<=', value: end },
    ];
    return this.timeEntryService.getTimeEntries(whereQuery);
  }

  /**
   *  Gets a list of timers and creates a map using the objects id.
   * @param {string[]} ids - An array of timer ids.
   */
  createTimerMap(timerIds: string[]): Observable<any> {
    const timerObservables = [];

    // Create an array of timer observables
    timerIds.forEach((id: string) => {
      const whereQuery: FirestoreWhere[] = [{ key: 'id', operator: '==', value: id }];
      timerObservables.push(this.timerService.getTimers(whereQuery));
    });

    // combineLatest with all timer observables.
    return combineLatest(timerObservables).map((results: any) => {
      results.forEach(timer => {
        const t = timer[0];
        this.timersMap[t.id] = t;
      });
    });
  }

  /**
   * Gets a user.
   * @param {string} id - The id of the user.
   * @return {Observable<any>} - An Observable with the user.
   */
  getUser(id: string): Observable<any> {
    return this.userService.getUser(id);
  }

  /**
   * Groups entries by user.
   * @param {TimeEntry[]} entries - The entries to group .
   */
  groupTimeByUser(entries: TimeEntry[]): Promise<TimeByUser[]> {
    const uniqueUserIds = [...new Set(entries.map(e => e.userId))];
    const timeByUser: TimeByUser[] = [];

    uniqueUserIds.forEach((id: string) => {
      let totalTime: number = 0;
      const userEntries: TimeEntry[] = [];

      // Get total time and user's entries
      entries.forEach((e: TimeEntry) => {
        if (id === e.userId) {
          console.log(e);
          totalTime += this.timeEntryService.duration(e.startTime.toDate(), e.endTime.toDate());
          userEntries.push(e);
        }
      });

      // Get the user's info
      this.getUser(id).subscribe((user: User) => {
        const index = timeByUser.findIndex(t => t.user.id === user.id);
        if (index < 0) {
          timeByUser.push({
            user,
            totalTime,
            entries: userEntries,
            activeTimer: false,
          });
        } else {
          timeByUser[index].user = user;
        }
      });
    });

    return Promise.resolve(timeByUser);
  }

  /**
   * Groups entries by day.
   * @param {TimeEntry[]} entries - The entries to group.
   */
  groupTimeByDay(entries: TimeEntry[]): void {
    const timeByDay = [];
    const uniqueDays = [...new Set(entries.map(e => moment(e.startTime.toDate()).format('MM/DD/YYYY')))];

    // Filter entries by day and then user
    for (const day of uniqueDays) {
      // Filter by day
      const entriesByDay = entries.filter((e: TimeEntry) => {
        return day === moment(e.startTime.toDate()).format('MM/DD/YYYY');
      });

      // Group by user
      this.groupTimeByUser(entriesByDay).then((timeByUser: TimeByUser[]) => {
        timeByDay.push({ day, timeByUser });
      });
    }

    this.timeByDay = timeByDay;
  }

  /**
   * Empties all report class variabes
   */
  resetReport() {
    this.timersMap = {};
    this.timeByUser = [];
  }

  /**
   * Converts seconds to decimal hours.
   * @param {number} seconds - The seconds to convert into hours.
   * @return {number} - Total hours w/ decimal.
   */
  secondsToDecimalHours(seconds: number): number {
    const mil = seconds * 1000;
    return Math.round(moment.duration(mil).asHours() * 10) / 10;
  }

  /**
   *
   * @param {string} name - The name to get initials from.
   */
  getInitials(name: string): string {
    const matches = name.match(/\b(\w)/g); // ['J','S','O','N']
    return matches.join('');
  }

  concatTimeDescriptions(entries: TimeEntry[]): string {
    const day = moment(entries[0].startTime.toDate()).format('MM/DD/YYYY');
    let timerIds = [];
    timerIds = [...new Set(entries.map(e => e.timerId))];

    return timerIds
      .map((id: string) => {
        const timer: TimerBase = this.timersMap[id];
        if (!timer) return '';
        const title = timer.title || '';
        const desc = timer.notes[day] || ' No Notes... ';

        return ` <b><u>${title}:</u></b> &nbsp${desc}&nbsp `;
      })
      .join('');
  }

  watchRunningTimers() {
    const query: FirestoreWhere[] = [{ key: 'active', operator: '==', value: true }];
    this.timerService.getTimers(query).subscribe(timers => {
      const users = timers.map(t => t.createdBy);
      this.timeByUser.forEach((userTime: TimeByUser) => {
        const active = users.findIndex(id => id === userTime.user.id) >= 0;
        userTime.activeTimer = active ? true : false;
      });

      this.timeByDay.forEach((timeByDay: TimeByDay) => {
        timeByDay.timeByUser = timeByDay.timeByUser.map(tbu => {
          const active = users.findIndex(id => id === tbu.user.id) >= 0;
          tbu.activeTimer = active ? true : false;
          return tbu;
        });
      });
    });
  }
}
