import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerDetailComponent } from './timer-detail.component';

describe('TimerDetailComponent', () => {
  let component: TimerDetailComponent;
  let fixture: ComponentFixture<TimerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimerDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
