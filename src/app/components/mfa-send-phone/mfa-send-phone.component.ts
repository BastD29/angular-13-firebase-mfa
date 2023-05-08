import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import phone from 'phone';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-mfa-send-phone',
  templateUrl: './mfa-send-phone.component.html',
  styleUrls: ['./mfa-send-phone.component.css'],
})
export class MfaSendPhoneComponent {
  form!: FormGroup;
  tel!: FormControl;
  country!: FormControl;
  currentUser: any;

  constructor(
    public authService: AuthService,
    public router: Router,
    public afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.currentUser = this.afAuth.currentUser;

    this.tel = new FormControl('', Validators.required);
    this.country = new FormControl('US');

    this.form = new FormGroup({
      tel: this.tel,
      country: this.country,
    });
  }

  resetFormFields() {
    this.form.reset({ tel: '', country: 'US' });
  }

  async handleSubmit() {
    try {
      const phoneNumber = phone(this.tel.value, {
        country: this.country.value,
      });

      if (phoneNumber) {
        await this.authService.StartEnrollMultiFactor(phoneNumber.phoneNumber);
      }

      this.resetFormFields();

      this.router.navigate(['/confirm-mfa-enroll']);
    } catch (error) {
      console.log(error);
    }
  }
}
