import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestore,
} from 'angularfire2/firestore';
import { Observable, Subject } from 'rxjs';
import { map } from '../../../node_modules/rxjs/operators';

interface AppSettings {
  id: string;
  version: string;
  releaseNotes?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private appSettingsId = '507f191e810c19729de860ea';
  private settingsCollection: AngularFirestoreCollection<object>;
  public appVersion: string;
  public newAppVersionAvailable = new Subject();

  constructor(private afs: AngularFirestore) {
    this.settingsCollection = this.afs.collection('appSettings');
    this.setAppVersion().subscribe(() => {
      this.watchAppUpdates();
    });
  }

  /**
   * Gets the apps settings
   */
  getSettings(): Observable<any> {
    return this.settingsCollection
      .doc(this.appSettingsId)
      .valueChanges()
      .map((res: any) => {
        return res;
      });
  }

  /**
   * Sets the apps version number.
   */
  private setAppVersion(): Observable<void> {
    return this.getSettings()
      .take(1)
      .pipe(
        map((s: AppSettings) => {
          if (s) {
            this.appVersion = s.version;
          } else {
            this.initializeAppSettings();
          }
        }),
      );
  }

  /**
   * Watches for changes in the apps settings
   */
  watchAppUpdates() {
    this.getSettings().subscribe((s: AppSettings) => {
      if (this.appVersion !== s.version) {
        this.newAppVersionAvailable.next(true);
      }
    });
  }

  /**
   * Initializes app settings if there arent any.
   */
  initializeAppSettings() {
    const settings: AppSettings = { id: this.appSettingsId, version: '0.0.0' };
    this.settingsCollection.doc(settings.id).set(settings);
    return this.settingsCollection
      .doc(settings.id)
      .valueChanges()
      .take(1)
      .subscribe((s: AppSettings) => {
        this.appVersion = s.version;
      });
  }
}
