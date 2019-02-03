import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GitlabNewTimerComponent } from './gitlab-new-timer.component';

describe('GitlabNewTimerComponent', () => {
  let component: GitlabNewTimerComponent;
  let fixture: ComponentFixture<GitlabNewTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GitlabNewTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GitlabNewTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
