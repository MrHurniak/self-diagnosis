import { Injectable } from "@angular/core";

export const MIN_COUNT = 10;
export const MAX_COUNT = 25;

@Injectable()
export class RandomService {

  private readonly probability = 0.5;

  generateSize(): number {
    return this.randomInt(
      MIN_COUNT, MAX_COUNT
    )
  }

  generateMatrix(size: number): string[][] {
    const res: string[][] = this.generateEmpty(size);
    for (let i = 0; i < size; i++) {
      for (let j = i; j < size; j++) {
        if (i === j) {
          continue;
        }
        if (Math.random() < this.probability) {
          res[i][j] = '1';
          res[j][i] = '1';
        }
      }
    }
    return res;
  }

  private generateEmpty(size: number): string[][] {
    const res = [];
    for (let i = 0; i < size; i++) {
      res.push([]);
      for (let j = 0; j < size; j++) {
        res[i].push('0');
      }
    }
    return res;
  }

  randomInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
}
