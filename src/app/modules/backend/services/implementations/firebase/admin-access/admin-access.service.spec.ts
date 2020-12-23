import { TestBed } from '@angular/core/testing';

import { AdminAccessService } from './admin-access.service';

describe('AdminAccessService', () => {
  let service: AdminAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
