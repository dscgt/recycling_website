import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageRoutesComponent } from './manage-routes.component';

describe('ManageRoutesComponent', () => {
  let component: ManageRoutesComponent;
  let fixture: ComponentFixture<ManageRoutesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageRoutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
