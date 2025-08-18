export interface Movie {
  id?: number; // Optional for search results
  movieId: number;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  times_watched: number;
}
