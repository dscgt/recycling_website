import { TestBed } from '@angular/core/testing';

import { FirebaseRoutesService } from './firebase-routes.service';

describe('FirebaseRoutesService', () => {
  let service: FirebaseRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
