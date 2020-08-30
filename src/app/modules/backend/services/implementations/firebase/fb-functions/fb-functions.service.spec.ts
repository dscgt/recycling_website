import { TestBed } from '@angular/core/testing';

import { FbFunctionsService } from './fb-functions.service';

describe('FbFunctionsService', () => {
  let service: FbFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
