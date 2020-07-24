import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageCheckinComponent } from './manage-checkin.component';

describe('ManageCheckinComponent', () => {
  let component: ManageCheckinComponent;
  let fixture: ComponentFixture<ManageCheckinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCheckinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
