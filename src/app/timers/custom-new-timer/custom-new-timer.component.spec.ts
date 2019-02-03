import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomNewTimerComponent } from './custom-new-timer.component';

describe('CustomNewTimerComponent', () => {
  let component: CustomNewTimerComponent;
  let fixture: ComponentFixture<CustomNewTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomNewTimerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomNewTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
