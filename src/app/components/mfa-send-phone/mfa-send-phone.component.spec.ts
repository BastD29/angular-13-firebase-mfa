import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfaSendPhoneComponent } from './mfa-send-phone.component';

describe('MfaSendPhoneComponent', () => {
  let component: MfaSendPhoneComponent;
  let fixture: ComponentFixture<MfaSendPhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MfaSendPhoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MfaSendPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
