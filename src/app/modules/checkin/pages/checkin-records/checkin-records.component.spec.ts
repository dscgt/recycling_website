import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckinRecordsComponent } from './checkin-records.component';

describe('CheckinRecordsComponent', () => {
  let component: CheckinRecordsComponent;
  let fixture: ComponentFixture<CheckinRecordsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckinRecordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckinRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
