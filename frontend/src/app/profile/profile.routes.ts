import { Routes } from '@angular/router';
import { Profile } from './profile/profile';
import { PersonalData } from './personal-data/personal-data';
import { Password } from './password/password';
import { Favorites } from './favorites/favorites';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: Profile,
    children: [
      { path: 'personal-data', component: PersonalData },
      { path: 'password', component: Password },
      { path: 'favorites', component: Favorites },
      { path: '', redirectTo: 'personal-data', pathMatch: 'full' }
    ]
  }
];


