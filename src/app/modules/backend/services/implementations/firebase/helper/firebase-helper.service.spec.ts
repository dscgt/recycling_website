import { TestBed } from '@angular/core/testing';

import { FirebaseHelperService } from './firebase-helper.service';

describe('FirebaseHelperService', () => {
  let service: FirebaseHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
