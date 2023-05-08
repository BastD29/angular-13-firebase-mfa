import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-send-verification-code',
  templateUrl: './send-verification-code.component.html',
  styleUrls: ['./send-verification-code.component.css'],
})
export class SendVerificationCodeComponent {
  mfaCode: string = '';
  mfaSuccessMessage: boolean = false;

  constructor(public authService: AuthService, public router: Router) {}

  ngOnInit(): void {}

  async handleSubmit(mfaForm: NgForm) {
    try {
      await this.authService.FinishEnrollmentMultiFactor(this.mfaCode);
      this.mfaCode = '';
      this.mfaSuccessMessage = true;
      // this.router.navigate(['/dashboard']);
    } catch (error) {
      console.log(error);
    }
  }

  goToProfile() {
    this.router.navigate(['/dashboard']);
  }
}
