import { TestBed } from '@angular/core/testing';

import { BackendRoutesService } from './backend-routes.service';

xdescribe('BackendRoutesService', () => {
  let service: BackendRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
