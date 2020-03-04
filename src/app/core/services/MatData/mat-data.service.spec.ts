import { TestBed } from '@angular/core/testing';

import { MatDataService } from './mat-data.service';

describe('MatDataService', () => {
  let service: MatDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
