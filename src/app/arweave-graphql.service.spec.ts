import { TestBed } from '@angular/core/testing';

import { ArweaveGraphqlService } from './arweave-graphql.service';

describe('ArweaveGraphqlService', () => {
  let service: ArweaveGraphqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArweaveGraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
