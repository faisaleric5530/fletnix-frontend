import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ShowsService } from '../../services/shows.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  show!: any; // Add non-null assertion or proper initialization
  isLoading = true;
  error = '';
  imageError = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private showsService: ShowsService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        if (id) {
          this.loadShow(id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadShow(id: string): void {
    this.isLoading = true;
    this.error = '';
    
    const authToken = localStorage.getItem("authToken") || undefined;

    this.showsService.getShowById(id, authToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.show = response.show;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
  }

  onImageError(): void {
    this.imageError = true;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getGenres(): string[] {
    if (!this.show?.listed_in) return [];
    return this.show.listed_in.split(',').map((genre: string) => genre.trim());
  }

  getCast(): string[] {
    if (!this.show?.cast) return [];
    return this.show.cast.split(',').map((actor: string) => actor.trim()).slice(0, 10);
  }

  getDirectors(): string[] {
    if (!this.show?.director) return [];
    return this.show.director.split(',').map((director: string) => director.trim());
  }

  getCountries(): string[] {
    if (!this.show?.country) return [];
    return this.show.country.split(',').map((country: string) => country.trim());
  }

  getRatingColor(): string {
    if (!this.show?.rating) return 'bg-gray-600';
    
    const rating = this.show.rating;
    if (['G', 'TV-G', 'TV-Y'].includes(rating)) return 'bg-green-600';
    if (['PG', 'TV-PG', 'TV-Y7'].includes(rating)) return 'bg-blue-600';
    if (['PG-13', 'TV-14'].includes(rating)) return 'bg-yellow-600';
    if (['R', 'TV-MA', 'NC-17'].includes(rating)) return 'bg-red-600';
    return 'bg-gray-600';
  }

  getRatingDescription(): string {
    if (!this.show?.rating) return 'Not Rated';
    
    const rating = this.show.rating;
    const descriptions: { [key: string]: string } = {
      'G': 'General Audiences - All ages admitted',
      'PG': 'Parental Guidance Suggested',
      'PG-13': 'Parents Strongly Cautioned - Ages 13+',
      'R': 'Restricted - Ages 17+',
      'NC-17': 'No One 17 and Under Admitted',
      'TV-Y': 'Suitable for all children',
      'TV-Y7': 'Suitable for ages 7 and up',
      'TV-G': 'General audience',
      'TV-PG': 'Parental guidance suggested',
      'TV-14': 'Parents strongly cautioned - Ages 14+',
      'TV-MA': 'Mature audience - Ages 17+'
    };
    
    return descriptions[rating] || rating;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  shareShow(): void {
    if (navigator.share) {
      navigator.share({
        title: this.show?.title,
        text: `Check out ${this.show?.title} on FletNix`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        // Could show a toast notification here
        console.log('Link copied to clipboard');
      });
    }
  }
}