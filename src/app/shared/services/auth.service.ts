import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from './user';
import * as auth from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any; // Save logged in user data
  verificationId: string | null = null;

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    // LOCALSTORAGE

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  // SIGN IN
  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user);
        this.afAuth.authState.subscribe((user) => {
          if (user) {
            // this.router.navigate(['dashboard']);
            this.router.navigate(['mfa-send-phone']);
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // MFA START
  async StartEnrollMultiFactor(phoneNumber: string | null) {
    const authInstance = auth.getAuth();
    const recaptchaVerifier = new auth.RecaptchaVerifier(
      'recaptcha',
      { size: 'invisible' },
      authInstance
    );

    const user = await this.afAuth.currentUser;

    if (user) {
      this.verificationId = await auth
        .multiFactor(user)
        .getSession()
        .then(function (multiFactorSession) {
          const phoneInfoOptions = {
            phoneNumber: phoneNumber,
            session: multiFactorSession,
          };

          const phoneAuthProvider = new auth.PhoneAuthProvider(authInstance);

          return phoneAuthProvider.verifyPhoneNumber(
            phoneInfoOptions,
            recaptchaVerifier
          );
        })
        .catch(function (error) {
          if (error.code == 'auth/invalid-phone-number') {
            alert(
              `Error with phone number formatting. 
               Phone numbers must start with +. ${error}`
            );
          } else {
            alert(`Error enrolling second factor. ${error}`);
          }
          throw error;
        });
    } else {
      console.log('no user');
      return;
    }
  }

  async FinishEnrollmentMultiFactor(verificationCode: string) {
    const user = await this.afAuth.currentUser;

    if (this.verificationId && user) {
      const cred = auth.PhoneAuthProvider.credential(
        this.verificationId,
        verificationCode
      );
      const multiFactorAssertion =
        auth.PhoneMultiFactorGenerator.assertion(cred);

      await auth
        .multiFactor(user)
        .enroll(multiFactorAssertion, 'My cellphone number')
        .catch(function (error) {
          alert(`Error finishing second factor enrollment. ${error}`);
          throw Error;
        });
      this.verificationId = null;
    }
  }

  // Sign up with email/password
  SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificationMail() function when new user sign up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // Reset password
  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Returns true when user is logged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }

  // Auth logic to run auth providers
  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.router.navigate(['dashboard']);
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
      this.router.navigate(['dashboard']);
    });
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
}
