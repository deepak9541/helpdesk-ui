import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Authentication'
    },
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
        data: {
          title: 'Login'
        }
      }
    ]
  }
];
