import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  getGenres(): string[] {
    return this.movie?.genres || [];
  }

  onImageError() {
    this.imageError = true;
  }

  viewDetails(id: string) {
    this.router.navigate(['/movie', id]);
  }
}