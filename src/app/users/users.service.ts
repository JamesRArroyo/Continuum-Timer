import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestore,
} from 'angularfire2/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './users.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private usersCollection: AngularFirestoreCollection<object>;
  private settingsCollection: AngularFirestoreCollection<object>; // TODO: Remove me when settings collection is empty.

  userSubject = new BehaviorSubject<any>({});
  user = this.userSubject.asObservable();

  constructor(
    private afs: AngularFirestore,
  ) {
    this.usersCollection = this.afs.collection('users');
    this.settingsCollection = this.afs.collection('settings'); // TODO: Remove me when settings collection is empty.
    this.setUserOnLogin();
  }

  /**
   * Sets the user on login creating it if new.
   */
  setUserOnLogin() {
    // Get or Create the user.

  }

  /**
   * Gets a user by id.
   * @param {string} id - The id of the user.
   */
  getUser(id: string): Observable<any> {
    return this.usersCollection.doc(id).valueChanges();
  }

  /**
   * Updates a user
   * @param {user} user - The updated user.
   */
  updateUser(user: User): Promise<void> {
    this.userSubject.next(user);
    return this.usersCollection.doc(user.id).set(user);
  }

  /**
   * Creates a user
   * @param {user} user - The new user.
   */
  createUser(user: User): Observable<any> {
    this.usersCollection.doc(user.id).set(user);
    return this.usersCollection.doc(user.id).valueChanges();
  }

  /* TEMP FUNCTION TO MIGRATE OLD SETTINGS
   * TODO: Remove me when settings collection is empty.
  */
  /**
   * Moves the users settings from the settings collection to the users record.
   */
  migrateUserSettings(user: User) {
    const settings$ = this.settingsCollection
      .doc(user.id)
      .valueChanges()
      .subscribe((s: any) => {
        if (s) {
          user.gitlab = { personalAccessToken: s.gitlabToken };
          this.updateUser(user).then(() => {
            settings$.unsubscribe();
            this.settingsCollection
              .doc(s.userId)
              .delete()
              .then(() => {
                console.log('settings migrated and deleted!!!');
              });
          });
        }
      });
  }
}
