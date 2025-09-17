export interface Show {
  _id: string;
  show_id: string;
  type: 'Movie' | 'TV Show';
  title: string;
  director: string;
  cast: string;
  country: string;
  date_added: string;
  release_year: number;
  rating: string;
  duration: string;
  listed_in: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowsResponse {
  shows: Show[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  filters: {
    search: string;
    type: string;
    rating: string;
    sortBy: string;
    sortOrder: string;
  };
}

export interface FilterOptions {
  types: string[];
  ratings: string[];
  genres: string[];
}