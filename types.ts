
export enum GameState {
  START_SCREEN = 'START_SCREEN',
  CAR_SELECTION = 'CAR_SELECTION',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface CarStats {
  id: string;
  name: string;
  brand: string;
  description: string;
  topSpeed: number;
  acceleration: number;
  handling: number;
  firepower: number;
  color: string;
}

export interface Obstacle {
  id: number;
  position: [number, number, number];
  health: number;
  type: 'box' | 'cylinder' | 'spike';
}

export interface Projectile {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
}
