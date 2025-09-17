import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isLoading = true;
  showHeaderFooter = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authenticated => {
        this.isAuthenticated = authenticated;
        this.isLoading = false;
      });

    // Hide header/footer on auth page
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.showHeaderFooter = !event.url.includes('/auth');
      });

    // Initial loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}