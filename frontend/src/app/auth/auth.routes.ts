import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { VerifyEmail } from './verify-email/verify-email';
import { ForgotPassword } from './forgot-password/forgot-password';
import { AdminLogin } from './admin-login/admin-login';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'admin-login', component: AdminLogin },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];


