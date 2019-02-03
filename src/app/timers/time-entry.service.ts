import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from 'angularfire2/firestore';
import { TimeEntry } from './timer-base.class';
import { Observable, Subject } from 'rxjs';
import { FirestoreWhere } from './timer.service';
import { QuerySnapshot } from '@firebase/firestore-types';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TimeEntryService {
  timeEntryCollection: AngularFirestoreCollection<TimeEntry>;

  constructor(public afs: AngularFirestore) {
    this.timeEntryCollection = this.afs.collection('timeEntries');
  }

  /**
   * Creates a time entry
   * @param {TimeEntry} timeEntry - The TimeEntry Object to be created.
   */
  createTimeEntry(timeEntry: TimeEntry): void {
    this.timeEntryCollection.add(timeEntry);
  }

  /**
   *
   * @param {FirestoreWhere[]} whereStatement - An array of where statements to query with.
   * @return {Promise<TimeEntry[]>}
   */
  getTimeEntries(whereStatement: FirestoreWhere[]): Promise<TimeEntry[]> {
    const wheres = whereStatement || [];

    let entryIds: CollectionReference | Query = this.timeEntryCollection.ref;
    wheres.forEach(w => (entryIds = entryIds.where(w.key, w.operator, w.value)));
    return entryIds.get().then((snapshot: QuerySnapshot) => {
      const timeEntryPromises = snapshot.docs.map(doc => {
        return this.getTimeEntry(doc.id);
      });
      return Promise.all(timeEntryPromises);
    });
  }

  /**
   * Gets an array of time entries subscribing to realtime updates.
   * @param {FirestoreWhere[]} whereStatement - An array of where statements to query with.
   * @return {Observable<TimeEntry[]>}
   */
  getTimeEntriesRealtime(whereStatement: FirestoreWhere[]): Observable<TimeEntry[]> {
    const wheres = whereStatement || [];

    let entryIds: CollectionReference | Query = this.timeEntryCollection.ref;
    wheres.forEach(w => (entryIds = entryIds.where(w.key, w.operator, w.value)));

    const timeEntriesChanges = new Subject<TimeEntry[]>();
    entryIds.onSnapshot(
      (s: QuerySnapshot) => {
        const timeEntryPromises = s.docs.map(doc => this.getTimeEntry(doc.id));
        Promise.all(timeEntryPromises).then((timeEntries: TimeEntry[]) => {
          timeEntriesChanges.next(timeEntries);
        });
      },
      (e: Error) => {
        timeEntriesChanges.error(e);
      },
    );
    return timeEntriesChanges;
  }

  /**
   *
   * @param {string} id - The id of the time entry to retrieve
   * @return {Promise<TimeEntry>} - A promise that holds a TimeEntry
   */
  getTimeEntry(id: string): Promise<TimeEntry> {
    return this.timeEntryCollection
      .doc(id)
      .valueChanges()
      .map((entry: TimeEntry) => {
        entry.id = id;
        return entry;
      })
      .take(1)
      .toPromise();
  }

  /**
   * Updates a time entry in the database.
   * @param {TimeEntry} timeEntry - The modified time entry to be updated.
   * @return {Promise<void>}
   */
  updateTimeEntry(timeEntry: TimeEntry): Promise<void> {
    timeEntry.modified = true;
    return this.timeEntryCollection.doc(timeEntry.id).set(timeEntry);
  }

  /**
   * Calculates the duration using two dates.
   * @param {Date} start  - Start time
   * @param {Date} end  - End time
   * @return {number} - The duration in seconds.
   */
  duration(start: Date, end: Date): number {
    const s = moment(start);
    const e = moment(end);
    return moment.duration(e.diff(s)).asSeconds();
  }

  /**
   * Deletes a time entry in the database.
   * @param {string} id - The id of the time entry to delete.
   * @return {Promise<void>}
   */
  deleteTimeEntry(id: string): Promise<void> {
    return this.timeEntryCollection.doc(id).delete();
  }
}
