import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userName:any = ''
  public route = inject(Router)
  ngOnInit(): void {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userName = user.displayName;
        console.log(user);
        
      } else {
        // User is signed out
        this.route.navigate(['signIn'])
      }
    });

  }






}
