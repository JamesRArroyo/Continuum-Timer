import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { MatSnackBar } from '@angular/material';
import { SettingsService } from './settings/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';

  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
  ) {
    this.monitorAppVersion();
  }

  monitorAppVersion() {
    this.settingsService.newAppVersionAvailable.subscribe(newVersion => {
      const message = 'A new version of the app is available.';
      const sb = this.snackBar.open(message, 'Refresh', {
        duration: 3600000 * 36, // (3 days (1 hour * 36))
        horizontalPosition: 'start',
        panelClass: 'snackbar-primary',
      });

      // Reload app on action
      sb.onAction().subscribe(() => {
        location.reload(true);
      });
    });
  }

  refresh() {}
}
