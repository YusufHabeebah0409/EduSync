import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  database = getDatabase();

  userName: any = ''
  public route = inject(Router)
  ngOnInit(): void {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const dataRef = ref(this.database, 'users/0' + uid);
        onValue(dataRef, (snapshot) => {
          const data = snapshot.val();
          this.userName = data.userName;
        });
      } else {
        this.route.navigate(['signIn'])
      }
    });
  }

  signOut() {
    auth.signOut().then(() => {
      this.route.navigate(['signIn'])
    }).catch((error) => {
      // console.log(error);
    });
  }





}
