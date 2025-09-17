import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { HomeComponent } from './components/home/home.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { 
    path: 'home', 
    component: HomeComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'movie/:id', 
    component: MovieDetailsComponent, 
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    enableTracing: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }