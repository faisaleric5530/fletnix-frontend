import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ShowsService, ShowsQueryParams } from '../../services/shows.service';
import { Show, ShowsResponse, FilterOptions } from '../../models/show.model';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MovieCardComponent
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  shows: Show[] = [];
  isLoading = true;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  hasNextPage = false;
  hasPrevPage = false;
  
  // Filters
  currentSearch = '';
  currentType = '';
  currentRating = '';
  currentSort = 'title';
  currentSortOrder: 'asc' | 'desc' = 'asc';
  
  // Filter options
  filterOptions: FilterOptions | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private showsService: ShowsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.currentPage = parseInt(params['page']) || 1;
        this.currentSearch = params['search'] || '';
        this.currentType = params['type'] || '';
        this.currentRating = params['rating'] || '';
        this.currentSort = params['sortBy'] || 'title';
        this.currentSortOrder = params['sortOrder'] || 'asc';
        
        this.loadShows();
      });

    this.loadFilterOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadShows(): void {
    this.isLoading = true;
    this.error = '';

    const params: ShowsQueryParams = {
      page: this.currentPage,
      limit: 15
    };

    const authToken = localStorage.getItem("authToken") || undefined;

    if (this.currentSearch.trim()) {
      params.search = this.currentSearch.trim();
    }
    if (this.currentType) {
      params.type = this.currentType;
    }
    if (this.currentRating) {
      params.rating = this.currentRating;
    }
    if (this.currentSort) {
      params.sortBy = this.currentSort;
    }
    if (this.currentSortOrder) {
      params.sortOrder = this.currentSortOrder;
    }

    this.showsService.getShows(params, authToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ShowsResponse) => {
          this.shows = response.shows;
          this.currentPage = response.pagination.currentPage;
          this.totalPages = response.pagination.totalPages;
          this.totalCount = response.pagination.totalCount;
          this.hasNextPage = response.pagination.hasNextPage;
          this.hasPrevPage = response.pagination.hasPrevPage;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
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

  onSortChange(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void {
    this.currentSort = sortBy;
    this.currentSortOrder = sortOrder;
    this.currentPage = 1;
    this.updateUrlAndLoadShows();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateUrlAndLoadShows();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearAllFilters(): void {
    this.currentSearch = '';
    this.currentType = '';
    this.currentRating = '';
    this.currentSort = 'title';
    this.currentSortOrder = 'asc';
    this.currentPage = 1;
    this.router.navigate(['/home']);
  }

  private updateUrlAndLoadShows(): void {
    const queryParams: any = {};
    
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    if (this.currentSearch.trim()) queryParams.search = this.currentSearch;
    if (this.currentType) queryParams.type = this.currentType;
    if (this.currentRating) queryParams.rating = this.currentRating;
    if (this.currentSort !== 'title') queryParams.sortBy = this.currentSort;
    if (this.currentSortOrder !== 'asc') queryParams.sortOrder = this.currentSortOrder;

    this.router.navigate(['/home'], { 
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : {}
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getSortDisplayName(sortBy: string): string {
    switch (sortBy) {
      case 'title': return 'Title';
      case 'release_year': return 'Release Year';
      case 'date_added': return 'Date Added';
      case 'rating': return 'Rating';
      case 'type': return 'Type';
      default: return sortBy;
    }
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.currentSearch.trim()) count++;
    if (this.currentType) count++;
    if (this.currentRating) count++;
    return count;
  }

  hasActiveFilters(): boolean {
    return this.getActiveFiltersCount() > 0;
  }

  trackByShowId(index: number, show: any): any {
    return show?.show_id || index; // ✅ Prefer unique ID if available, fallback to index
  }
}