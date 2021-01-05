import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpansionTableComponent } from './expansion-table.component';

describe('ExpansionTableComponent', () => {
  let component: ExpansionTableComponent<any>;
  let fixture: ComponentFixture<ExpansionTableComponent<any>>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpansionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpansionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
