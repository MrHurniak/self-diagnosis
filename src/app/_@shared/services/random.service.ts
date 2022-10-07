import { Injectable } from '@angular/core';
import { EMPTY, MAX_COUNT, MIN_COUNT, PRESENT } from '../utils/constants';
import { NODE_LINK_PROBABILITY } from '../utils/configs';
import { MatrixService } from './matrix.service';


@Injectable()
export class RandomService {

  public generateSize(): number {
    return RandomService.randomInt(
      MIN_COUNT, MAX_COUNT + 1
    );
  }

  public generateMatrix(size: number): string[][] {
    const res: string[][] = MatrixService.initEmptyMatrix(size, EMPTY);
    for (let i = 0; i < size; i++) {
      for (let j = i; j < size; j++) {
        if (i === j) {
          continue;
        }
        if (Math.random() < NODE_LINK_PROBABILITY) {
          res[i][j] = PRESENT;
          res[j][i] = PRESENT;
        }
      }
    }
    return res;
  }

  public static randomInt(minInclusive: number, maxExclusive: number): number {
    return Math.floor(minInclusive + Math.random() * (maxExclusive - minInclusive));
  }
}
