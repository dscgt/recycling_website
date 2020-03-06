import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinRecordsComponent } from './checkin-records.component';

describe('CheckinRecordsComponent', () => {
  let component: CheckinRecordsComponent;
  let fixture: ComponentFixture<CheckinRecordsComponent>;

  beforeEach(async(() => {
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
