import { TestBed, inject } from '@angular/core/testing';

import { SlimloaderService } from './slimloader.service';

describe('SlimloaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SlimloaderService]
    });
  });

  it('should be created', inject([SlimloaderService], (service: SlimloaderService) => {
    expect(service).toBeTruthy();
  }));
});
