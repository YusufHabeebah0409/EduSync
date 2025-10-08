import { Routes } from '@angular/router';
import { Signup } from './signup/signup';
import { Signin } from './signin/signin';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    {path: '', component: Signup, title: 'Sign Up '},
    {path:'signIn', component: Signin,title: 'Sign In '},
    {path:'dashboard', component:Dashboard, title: 'Dashboard'}
];
