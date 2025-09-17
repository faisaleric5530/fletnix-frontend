import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css'],
  imports: [CommonModule],
})
export class MovieCardComponent {
  @Input() movie: any;
  @Input() show: any;

  imageError = false;

  getGenres(): string[] {
    return this.movie?.genres || [];
  }

  onImageError() {
    this.imageError = true;
  }

  viewDetails(): void {
    console.log('Viewing details for:', this.show || this.movie);
  }
}