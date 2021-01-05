import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RouteRecordsComponent } from './route-records.component';

describe('RouteRecordsComponent', () => {
  let component: RouteRecordsComponent;
  let fixture: ComponentFixture<RouteRecordsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteRecordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
