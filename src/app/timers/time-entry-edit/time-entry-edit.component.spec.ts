import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeEntryEditComponent } from './time-entry-edit.component';

describe('TimeEntryEditComponent', () => {
  let component: TimeEntryEditComponent;
  let fixture: ComponentFixture<TimeEntryEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeEntryEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeEntryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
