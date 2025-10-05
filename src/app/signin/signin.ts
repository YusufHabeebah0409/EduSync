import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { auth } from '../../firebase.config'
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
  public builder = inject(FormBuilder);

  signIn = this.builder.group({
    eMail: ['', [Validators.required, Validators.email]],
    passWord: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]]
  });

  signInBtn() {
    const { eMail, passWord } = this.signIn.value;

    signInWithEmailAndPassword(auth, eMail, passWord)

      .then((userCredential) => {
        const user = userCredential.user;

        // ✅ Check if the user's email is verified
        if (user.emailVerified) {
          alert('Login successful 🎉');
          console.log('User logged in:', user);
        } else {
          alert('Please verify your email before logging in.');
          signOut(auth); // 🚪 logs the user out immediately
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        alert(`Error: ${error.message}`);
      });

  }

  googleBtn() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
    .then((result) => {
      console.log(result);
      
    
  }).catch((error) => {
    const errorMessage = error.message;
    console.log(errorMessage);
    
  });

  }
}
