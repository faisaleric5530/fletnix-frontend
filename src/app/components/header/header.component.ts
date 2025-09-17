import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ShowsService } from '../../services/shows.service';
import { User } from '../../models/user.model';
import { FilterOptions } from '../../models/show.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  user?: { email: string; age?: number; isAdult?: boolean };
  isProfileMenuOpen = false;
  isFilterMenuOpen = false;
  searchControl = new FormControl('');
  filterOptions: FilterOptions | null = null;
  selectedType = '';
  selectedRating = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private showsService: ShowsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = {
      email: 'test@example.com',
      age: 25,
      isAdult: true
    };
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | any) => this.user = user ? { email: user.email } : undefined);

    this.loadFilterOptions();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        if (this.router.url === '/home' || this.router.url === '/') {
          this.performSearch(query || '');
        } else {
          this.router.navigate(['/home'], { 
            queryParams: { search: query || undefined }
          });
        }
      });
  }

  private loadFilterOptions(): void {
    const authToken = localStorage.getItem("authToken") || undefined;

    this.showsService.getFilterOptions(authToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => this.filterOptions = options,
        error: (error) => console.error('Failed to load filter options:', error)
      });
  }

  performSearch(query: string): void {
    this.router.navigate(['/home'], {
      queryParams: { 
        search: query || undefined,
        type: this.selectedType || undefined,
        rating: this.selectedRating || undefined
      }
    });
  }

  onTypeFilter(type: string): void {
    this.selectedType = type;
    this.performSearch(this.searchControl.value || '');
    this.isFilterMenuOpen = false;
  }

  onRatingFilter(rating: string): void {
    this.selectedRating = rating;
    this.performSearch(this.searchControl.value || '');
    this.isFilterMenuOpen = false;
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedRating = '';
    this.searchControl.setValue('');
    this.router.navigate(['/home']);
    this.isFilterMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    if (this.isProfileMenuOpen) {
      this.isFilterMenuOpen = false;
    }
  }

  toggleFilterMenu(): void {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
    if (this.isFilterMenuOpen) {
      this.isProfileMenuOpen = false;
    }
  }

  closeMenus(): void {
    this.isProfileMenuOpen = false;
    this.isFilterMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  navigateHome(): void {
    this.router.navigate(['/home']);
  }
}