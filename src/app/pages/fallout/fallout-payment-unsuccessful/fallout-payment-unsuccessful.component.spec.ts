import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FalloutPaymentUnsuccessfulComponent } from './fallout-payment-unsuccessful.component';

describe('FalloutPaymentUnsuccessfulComponent', () => {
  let component: FalloutPaymentUnsuccessfulComponent;
  let fixture: ComponentFixture<FalloutPaymentUnsuccessfulComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FalloutPaymentUnsuccessfulComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FalloutPaymentUnsuccessfulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
