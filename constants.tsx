
import { CarStats } from './types';

export const CARS: CarStats[] = [
  {
    id: 'f40',
    name: 'F40 Tribute',
    brand: 'Ferrari',
    description: 'The ultimate analog beast. Lightweight and aggressive.',
    topSpeed: 210,
    acceleration: 0.85,
    handling: 0.95,
    firepower: 80,
    color: '#ff1111'
  },
  {
    id: 'aventador',
    name: 'Aventador V12',
    brand: 'Lamborghini',
    description: 'A roaring V12 engine with all-wheel drive stability.',
    topSpeed: 235,
    acceleration: 0.75,
    handling: 0.7,
    firepower: 100,
    color: '#ffea00'
  },
  {
    id: 'chiron',
    name: 'Hyper King',
    brand: 'Bugatti',
    description: 'The pinnacle of luxury and extreme straight-line speed.',
    topSpeed: 280,
    acceleration: 0.98,
    handling: 0.5,
    firepower: 60,
    color: '#0044ff'
  },
  {
    id: 'gt3rs',
    name: 'Track Master',
    brand: 'Porsche',
    description: 'Built for the corners. Perfect handling for narrow escapes.',
    topSpeed: 195,
    acceleration: 0.9,
    handling: 1.1,
    firepower: 90,
    color: '#eeeeee'
  }
];

export const GAME_DURATION = 60; // seconds
export const NITRO_RECHARGE_RATE = 15; // percent per second
export const WEAPON_DURATION = 8; // seconds of firing time
export const WEAPON_COOLDOWN = 12; // seconds to recharge
