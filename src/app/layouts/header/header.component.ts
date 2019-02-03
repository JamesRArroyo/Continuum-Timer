import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user: any = { name: 'John Doe' };
  appName: string;

  constructor(
    private userService: UsersService,
  ) {}

  ngOnInit() {
    this.appName = environment.appName;
    this.getUser();
  }

  getUser() {
    this.userService.user.subscribe(u => (this.user = u));
  }

  logout() {
  }
}
