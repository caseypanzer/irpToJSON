import { TestBed, inject } from '@angular/core/testing';

import { XlsxParserHelperService } from './xlsx-parser-helper.service';

describe('XlsxParserHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XlsxParserHelperService]
    });
  });

  it('should be created', inject([XlsxParserHelperService], (service: XlsxParserHelperService) => {
    expect(service).toBeTruthy();
  }));
});
