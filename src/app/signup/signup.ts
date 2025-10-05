import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, FormsModule,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  public builder = inject(FormBuilder);

  signUp = this.builder.group({
    userName: ['', [Validators.required, Validators.minLength(2)]],
    eMail: ['', [Validators.required, Validators.email]],
    passWord: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]]
  });



  signUpBtn() {
    const { eMail, passWord } = this.signUp.value;

    createUserWithEmailAndPassword(auth, eMail!, passWord!,)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);

        sendEmailVerification(user)
          .then(() => {
            alert('Signup successful! Please check your email to verify your account.');
            console.log('Verification email sent to:', user.email);
          })
          .catch((error) => {
            console.error('Error sending verification email:', error);
          });

        
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
        
      });
  }

  googleBtn(){
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
