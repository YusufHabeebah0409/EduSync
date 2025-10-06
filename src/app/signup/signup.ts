import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { RouterLink } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'



@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  isLoading = false;
  private snackBar = inject(MatSnackBar);
  public builder = inject(FormBuilder);

  signUp = this.builder.group({
    userName: ['', [Validators.required, Validators.minLength(2)]],
    eMail: ['', [Validators.required, Validators.email]],
    passWord: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]]
  });


  signUpBtn() {
    const { eMail, passWord } = this.signUp.value;

    createUserWithEmailAndPassword(auth, eMail!, passWord!)
      .then((userCredential) => {
        const user = userCredential.user;

        sendEmailVerification(user)
          .then(() => {
            this.snackBar.open(
              `Signup successful! A verification link has been sent to ${user.email}.`,
              'Close',
              { duration: 4000, 
              horizontalPosition: 'right', 
              verticalPosition: 'top', 
              panelClass: ['success-snackbar'] }
            );
            this.signUp.reset();
          })
          .catch((error) => {
            switch (error.code) {
              case 'auth/missing-email':
                this.showWarning('Email address missing.');
                break;
              case 'auth/too-many-requests':
                this.showWarning('Too many attempts. Wait a few minutes and try again.');
                break;
              case 'auth/network-request-failed':
                this.showError('Network error. Check your connection.');
                break;
              default:
                this.showError(`Error sending verification email`);
            }
          });
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            this.showError('This email is already in use. Try signing up with another email.');
            break;
          case 'auth/invalid-email':
            this.showWarning('Invalid email format. Please check and try again.');
            break;
          case 'auth/weak-password':
            this.showWarning('Weak password. Use 8+ chars, 1 uppercase, 1 number, and 1 symbol.');
            break;
          case 'auth/missing-password':
            this.showWarning('Please enter a password.');
            break;
          case 'auth/missing-email':
            this.showWarning('Please enter your email address.');
            break;
          case 'auth/operation-not-allowed':
            this.showError('Email/password sign-up is disabled. Contact admin.');
            break;
          case 'auth/invalid-credential':
            this.showError('Invalid credentials provided.');
            break;
          case 'auth/network-request-failed':
            this.showError('Network error. Please check your internet connection.');
            break;
          case 'auth/too-many-requests':
            this.showWarning('Too many attempts. Please try again later.');
            break;
          case 'auth/internal-error':
            this.showError('Something went wrong. Try again later.');
            break;
          default:
            this.showError(`An Error Occurred, Please Try Again Later`);
        }
      });
  }

  googleBtn() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        this.showSuccess('Signed in with Google successfully!');
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            this.showWarning('You closed the sign-in popup before completing the process.');
            break;
          case 'auth/cancelled-popup-request':
            this.showWarning('Popup closed. Try signing in again.');
            break;
          case 'auth/popup-blocked':
            this.showWarning('Popup was blocked by your browser. Allow popups and retry.');
            break;
          case 'auth/account-exists-with-different-credential':
            this.showError('This email is already linked with another sign-in method.');
            break;
          case 'auth/invalid-credential':
            this.showError('Invalid Google credentials. Try again.');
            break;
          case 'auth/operation-not-allowed':
            this.showError('Google sign-in not enabled. Contact admin.');
            break;
          case 'auth/network-request-failed':
            this.showError('Network error. Please check your connection.');
            break;
          case 'auth/unauthorized-domain':
            this.showError('This domain is not authorized for Google sign-in.');
            break;
          default:
            this.showError(`Google sign-in failed`);
        }
      });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showWarning(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar']
    });
  }
}
