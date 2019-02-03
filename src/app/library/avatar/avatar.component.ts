import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  @Input() image: string;
  @Input() route: string[] = null;
  @Input() routeQueryParams: any;
  @Input() active: boolean = false;

  constructor() {}

  ngOnInit() {}
}
