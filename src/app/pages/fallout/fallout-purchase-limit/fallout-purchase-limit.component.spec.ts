import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FalloutPurchaseLimitComponent } from './fallout-purchase-limit.component';

describe('FalloutPurchaseLimitComponent', () => {
  let component: FalloutPurchaseLimitComponent;
  let fixture: ComponentFixture<FalloutPurchaseLimitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FalloutPurchaseLimitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FalloutPurchaseLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
