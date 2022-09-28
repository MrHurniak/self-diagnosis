import { Injectable } from '@angular/core';
import { EMPTY, PRESENT } from '../utils/constants';

export const MIN_COUNT = 10;
export const MAX_COUNT = 25;
export const DEFAULT_COUNT = 18;

@Injectable()
export class RandomService {

  private readonly probability = 0.5;

  public generateSize(): number {
    return this.randomInt(
      MIN_COUNT, MAX_COUNT
    )
  }

  public generateMatrix(size: number): string[][] {
    const res: string[][] = this.generateEmpty(size);
    for (let i = 0; i < size; i++) {
      for (let j = i; j < size; j++) {
        if (i === j) {
          continue;
        }
        if (Math.random() < this.probability) {
          res[i][j] = PRESENT;
          res[j][i] = PRESENT;
        }
      }
    }
    return res;
  }

  public randomInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  private generateEmpty(size: number): string[][] {
    const res = [];
    for (let i = 0; i < size; i++) {
      res.push([]);
      for (let j = 0; j < size; j++) {
        res[i].push(EMPTY);
      }
    }
    return res;
  }
}
