import { TestBed } from '@angular/core/testing';

import { Asset2Service } from './asset2.service';

describe('Asset2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Asset2Service = TestBed.get(Asset2Service);
    expect(service).toBeTruthy();
  });
});
