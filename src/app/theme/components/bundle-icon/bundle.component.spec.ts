import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BundleIconComponent } from './bundle-icon.component';
import { MatCardModule } from '@angular/material';



describe('BundleIconComponent', () => {
  let component: BundleIconComponent;
  let fixture: ComponentFixture<BundleIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundleIconComponent ],
      imports:[
        MatCardModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundleIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
