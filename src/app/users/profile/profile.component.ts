import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { SettingsService } from '../../settings/settings.service';
import { UsersService } from '../users.service';
import { User } from '../users.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User;
  hide: boolean;
  constructor(
    private usersService: UsersService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.hide = true;
    this.profileForm = new FormGroup({
      name: new FormControl(),
      email: new FormControl(),
      gitlabToken: new FormControl(),
    });

    this.setUser();
  }

  setUser(): void {
    this.usersService.user.subscribe((u: User) => {
      if (u.id) {
        this.user = u;
        const form = this.profileForm;
        form.controls['name'].setValue(u.name);
        form.controls['email'].setValue(u.email);
        form.controls['gitlabToken'].setValue(u.gitlab.personalAccessToken);
      }
    });
  }

  updateUser(): void {
    const formValues = this.profileForm.value;
    this.user.name = formValues.name;
    this.user.email = formValues.email || '';
    this.user.gitlab.personalAccessToken = formValues.gitlabToken;
    this.usersService.updateUser(this.user).then(() => {
      this.snackBar.open('Profile was successfully updated!', null, {
        duration: 3000,
      });
    });
  }
}
