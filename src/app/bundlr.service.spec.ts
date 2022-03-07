import { TestBed } from '@angular/core/testing';

import { BundlrService } from './bundlr.service';

describe('BundlrService', () => {
  let service: BundlrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BundlrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
