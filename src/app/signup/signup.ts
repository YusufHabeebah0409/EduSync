import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'



@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  database = getDatabase();
  isLoading = false;
  btnText = true;
  private snackBar = inject(MatSnackBar);
  public builder = inject(FormBuilder);
  public route = inject(Router)

  signUp = this.builder.group({
    userName: ['', [Validators.required, Validators.minLength(2)]],
    eMail: ['', [Validators.required, Validators.email]],
    passWord: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]]
  });




  signUpBtn() {
    this.isLoading = true;
    this.btnText = false;
    const { eMail, passWord } = this.signUp.value;

    createUserWithEmailAndPassword(auth, eMail!, passWord!)

      .then((userCredential) => {
        this.isLoading = false;
        this.btnText = true;
        const user = userCredential.user;

        sendEmailVerification(user)
          //  Email Verification 
          .then(() => {

            this.isLoading = false;
            this.btnText = true;

            // Storing user data in Realtime Database

            const dataRef = ref(this.database, 'users/0' + user.uid);

            const users = {
              userName: this.signUp.value.userName,
              eMail: this.signUp.value.eMail,
            };
            onValue(dataRef, (snapshot) => {
              const data = snapshot.val();

              if (data?.eMail === users.eMail) {
                this.showError('User already exists. Please sign in instead.');
              } else {
                set(dataRef, users);
                this.snackBar.open(
                  `Signup successful! A verification link has been sent to ${user.email}.`,
                  'Close',
                  {
                    duration: 4000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['success-snackbar']
                  }
                );
                 this.signUp.reset();
                this.route.navigate(['/signIn']);
              }
            }, { onlyOnce: true });



           
          })
          .catch((error) => {
            this.isLoading = false;
            this.btnText = true;
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
        this.isLoading = false;
        this.btnText = true;
        switch (error.code) {
          case 'auth/email-already-in-use':
            this.showError('This email is already in use. Try signing up with another email.');
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
      .then((response) => {

         // Storing user data in Realtime Database

            const dataRef = ref(this.database, 'users/0' + response.user.uid);

            const users = {
              userName: response.user.displayName,
              eMail: response.user.email,
            };
            onValue(dataRef, (snapshot) => {
              const data = snapshot.val();

              if (data?.eMail === users.eMail) {
                // this.showError('User already exists. Please sign in instead.');
                this.route.navigate(['/dashboard']);

              } else {
                 this.showSuccess('Signed in with Google successfully!');
                set(dataRef, users);
        
                this.route.navigate(['/dashboard']);

              }
            }, { onlyOnce: true });
       

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
