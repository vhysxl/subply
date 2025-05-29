export interface Games {
  gameId: string;
  name: string;
  isPopular: boolean;
  currency: string;
  imageUrl: string | null;
}

export interface CreateGame {
  name: string;
  isPopular: boolean;
  currency: string;
  imageUrl: string | null;
}
