import { TestBed, inject } from '@angular/core/testing';

import { InvestmentService } from './investment.service';

describe('InvestmentServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvestmentService]
    });
  });

  it('should be created', inject([InvestmentService], (service: InvestmentService) => {
    expect(service).toBeTruthy();
  }));
});
