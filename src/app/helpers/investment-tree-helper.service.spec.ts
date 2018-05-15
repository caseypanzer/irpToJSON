import { TestBed, inject } from '@angular/core/testing';

import { InvestmentTreeHelperService } from './investment-tree-helper.service';

describe('InvestmentTreeHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvestmentTreeHelperService]
    });
  });

  it('should be created', inject([InvestmentTreeHelperService], (service: InvestmentTreeHelperService) => {
    expect(service).toBeTruthy();
  }));
});
