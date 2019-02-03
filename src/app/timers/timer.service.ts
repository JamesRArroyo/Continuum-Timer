import { Injectable } from '@angular/core';
import { TimerBase, TimeEntry } from './timer-base.class';
import { CustomTimer } from './timer-custom';
import { GitlabTimer } from '../gitlab/timer-gitlab.class';
import {
  AngularFirestoreCollection,
  AngularFirestore,
  CollectionReference,
  Query,
} from 'angularfire2/firestore';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Rx';
import { QuerySnapshot, WhereFilterOp } from '@firebase/firestore-types';
import { GitlabService } from '../gitlab/gitlab.service';
import { TimeEntryService } from './time-entry.service';
import { take, last } from 'rxjs/operators';
import { UsersService } from '../users/users.service';

export interface FirestoreWhere {
  key: string;
  operator: WhereFilterOp;
  value: any;
}
@Injectable()
export class TimerService {
  timersCollection: AngularFirestoreCollection<object>;
  timers = new BehaviorSubject<TimerBase[]>([]);
  currentTimers = this.timers.asObservable();
  activeTimer: TimerBase = null;
  timerSubscriptions: any[] = [];
  private user;

  constructor(
    public afs: AngularFirestore,
    private userService: UsersService,
    private gitlabService: GitlabService,
    private timeEntryService: TimeEntryService,
  ) {
    this.timersCollection = this.afs.collection('timers');
    this.userService.user.subscribe(u => {
      this.user = u;
      if (u.id) {
        this.setOpenTimers();
      }
    });
  }

  /**
   * Creates a timer
   * @param {any} timer - A json timer object.
   */
  createTimer(timerObject: any): void {
    this.createDerivedTimer(timerObject).subscribe(dt => {
      dt.createdBy = this.user.id;
      const timerObj = Object.assign({}, dt);
      delete timerObj.id;
      this.timersCollection.add(timerObj).then(ref => {
        dt.id = ref.id;
        this.startTimer(dt);
      });
    });
  }

  /**
   * Starts a timer
   * @param {TimerBase} timer - The timer to be started.
   */
  startTimer(timer: TimerBase): void {
    if (this.activeTimer) {
      // Pause the active timer
      this.activeTimer.pauseTimer().then((t: TimerBase) => {
        this.updateTimer(t);

        this.timeEntryService.createTimeEntry(t.previousTimeEntry);
      });
    }

    timer.startTimer(); // Start the new timer
    this.updateTimer(timer);

    this.activeTimer = timer; // set the new active timer
    // this.activeTimerToFront(timer); // Move the new active timer to the front of array.
  }

  /**
   * Pauses a timer
   * @param {TimerBase} timer - The timer to be paused.
   */
  pauseTimer(timer: TimerBase): void {
    timer.pauseTimer().then((t: TimerBase) => {
      this.updateTimer(t);
      this.activeTimer = null;
      // Create timeEntry
      this.timeEntryService.createTimeEntry(t.previousTimeEntry);
    });
  }

  /*
  * Ends a Timer
  */
  endTimer(timer: TimerBase): void {
    timer.endTimer().then(() => {
      // Create timeEntry

      if (timer.newEntry) {
        this.timeEntryService.createTimeEntry(timer.previousTimeEntry);
      }

      this.updateTimer(timer);

      /**
       * TODO: This logic needs to go in the endTimer function in the gitlab class.
       * Need to figure out how to use a service in a class.
       */
      if (timer.timerType === 'gitlab') {
        const pid = timer.details.project_id;
        const iid = timer.details.iid;
        const notes = timer.notes;

        // Get all time entries
        const entryWhereQuery: FirestoreWhere[] = [
          { key: 'timerId', operator: '==', value: timer.id },
        ];
        const entrySub = this.timeEntryService
          .getTimeEntries(entryWhereQuery)
          .then((entries: TimeEntry[]) => {
            const totalTime = entries.reduce(
              (t, e) =>
                t +
                this.timeEntryService.duration(
                  e.startTime.toDate(),
                  e.endTime.toDate(),
                ),
              0,
            );

            // Log time to gitlab.
            this.gitlabService
              .addSpentTimeOnIssue(pid, iid, String(totalTime))
              .subscribe();
          });

        this.gitlabService.addCommentOnIssue(pid, iid, notes).subscribe();
      }
    });
  }

  /**
   * Gets and sets the users open timers.
   */
  private setOpenTimers(): void {
    // Subscribe to a set of timers
    this.timersCollection.ref
      .where('createdBy', '==', this.user.id)
      .where('state', '==', 'open')
      .onSnapshot((t: QuerySnapshot) => {
        /* Cleanup timers that arent in snapshot anymore.*/
        this.timersCleanup(t);
        // Loop through each timer
        t.docs.forEach((docRef: any) => {
          const timerId: string = docRef.id;
          const timerIsNew =
            this.timers.getValue().findIndex(t => t.id === timerId) < 0;

          // If the timer is new then subscribe to the timer and all updates from db.
          if (timerIsNew) {
            // Subscribe to each timer.
            this.subscribeToTimer(timerId);
          }
        });
      });
  }

  /**
   * Gets timers.
   */
  public getTimers(whereStatement?: FirestoreWhere[]): Observable<any> {
    const wheres = whereStatement || [];

    return this.afs
      .collection('timers', ref => {
        let query: CollectionReference | Query = ref;
        wheres.forEach(w => (query = query.where(w.key, w.operator, w.value)));
        return query;
      })
      .valueChanges();
  }

  /**
   * Subscribes to a timer.
   * @param {string} id - The id of the timer.
   */
  private subscribeToTimer(id: string): void {
    const sub = this.getTimer(id).subscribe(timer => {
      const i = this.timers.getValue().findIndex(t => t.id === id);

      // Sync or create timer depending on if its already loaded.
      if (i >= 0) {
        this.timers.getValue()[i].sync(timer);
      } else {
        this.createDerivedTimer(timer).subscribe(dt => {
          const timers = this.timers.getValue();
          timers.push(dt);
          this.timers.next(timers);

          if (dt.active) {
            this.activeTimer = dt;
          }
        });
      }
    });

    // Add subscription to timer subscription array.
    this.timerSubscriptions.push({ sub, id });
  }

  /**
   * Unsubscribes from a timer.
   * @param {string} id - The id of the timer.
   */
  private unsubscribeFromTimer(id: string): void {
    const subObj = this.timerSubscriptions.find(s => s.id === id);
    subObj.sub.unsubscribe();
  }

  /**
   * Creates a derived Timer class.
   * @param {any} timer - A json timer.
   * @return {Observable<TimerBase>} An observable with the new derived Timer class.
   */
  private createDerivedTimer(timer: any): Observable<TimerBase> {
    let derivedTimer: TimerBase;

    switch (timer.timerType) {
      case 'custom':
        derivedTimer = new CustomTimer(timer);
        break;
      case 'gitlab':
        derivedTimer = new GitlabTimer(timer);
        break;
      default:
        throw new Error(`Timer - ${timer.timerType} not handled!!!`);
    }

    return Observable.of(derivedTimer);
  }

  /**
   * Retrives a timer from the db.
   * @param {string} id - The id of the timer.
   * @return {Observable<any>} Observable with the timer object.
   */
  private getTimer(id: string): Observable<any> {
    return this.timersCollection
      .doc(id)
      .valueChanges()
      .map((t: any) => {
        t.id = id;
        return t;
      });
  }

  /**
   * Updates a timer in the database.
   * @param {TimerBase} timer - The updated timer class.
   */
  public updateTimer(timer: TimerBase): Promise<void> {
    const timerObj = <any>Object.assign({}, timer);
    delete timerObj.timerSubscription;
    if (timerObj.timer) {
      delete timerObj.timer.timer;
    }

    return this.timersCollection.doc(timerObj.id).set(timerObj);
  }

  /**
   * Checks for timers that no longer need to be in the timers array.
   * @param {QuerySnapshot} timersSnapshot - An array of timer ids that meet the db query.
   */
  private timersCleanup(timersSnapshot: QuerySnapshot): void {
    const ids = timersSnapshot.docs.map(d => d.id);

    this.timers.getValue().forEach(timer => {
      const timerExists = ids.findIndex(id => id === timer.id) >= 0;
      const i = this.timers.getValue().findIndex(t => t.id === timer.id);

      // Unsubscribe and remove timer from timers array if it doesnt not exist in criteria anymore.
      if (!timerExists) {
        this.unsubscribeFromTimer(timer.id);
        const timers = this.timers.getValue();
        timers.splice(i, 1); // Remove timer from array
        this.timers.next(timers);
      }
    });
  }

  /*
  * Re-positions an array item to the front
  */
  private activeTimerToFront(timer: TimerBase): void {
    /*  const index = this.timers.indexOf(timer);
    this.timers.splice(index, 1); // Remove timer from array

    this.timers.unshift(timer); // Add timer to front of array */
  }
}
