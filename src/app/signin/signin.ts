import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { auth } from '../../firebase.config'
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDatabase, ref, set, onValue } from 'firebase/database'
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
  database = getDatabase();

  isLoading = false;
  btnText = true;
  private snackBar = inject(MatSnackBar);
  public builder = inject(FormBuilder);
  public route = inject(Router);

  signIn = this.builder.group({
    eMail: ['', [Validators.required, Validators.email]],
    passWord: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]]
  });

  signInBtn() {
    this.isLoading = true;
    this.btnText = false;
    const { eMail, passWord } = this.signIn.value;

    signInWithEmailAndPassword(auth, eMail!, passWord!)

      .then((userCredential) => {
        this.isLoading = false;
         this.btnText = true;
        const user = userCredential.user;
        if (user.emailVerified) {
          this.snackBar.open(`Login successful 🎉`, 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.signIn.reset()
          this.route.navigate(['/dashboard'])
        } else {
          this.snackBar.open(`Please verify your email before logging in.`, 'Close', {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['warning-snackbar']
          });
          // signOut(auth);
        }
      })
      .catch((error) => {
        this.isLoading = false;
         this.btnText = true;
         const errorCode = error.code;
        console.error('Login error:', errorCode);
        console.log(JSON.stringify(error, null, 2));


        // alert(`Error: ${error.message}`);

        switch (errorCode) {
          case 'auth/invalid-email':
            this.showError('Invalid email address. Please enter a valid one.');
            break;
          case 'auth/user-disabled':
            this.showError('This account has been disabled. Contact support.');
            break;
          case 'auth/user-not-found':
            this.showError('No account found with this email. Please sign up first.');
            break;
          case 'auth/wrong-password':
            this.showError('Incorrect password. Please try again.');
            break;
          case 'auth/too-many-requests':
            this.showError('Too many failed attempts. Try again later.');
            break;
          case 'auth/network-request-failed':
            this.showError('Network error. Check your internet connection.');
            break;
          case 'auth/invalid-credential':
            this.showError('Invalid email or password. Please check your details and try again.');
            break;
          default:
            this.showError('An unknown error occurred. Please try again.');
            break;
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
