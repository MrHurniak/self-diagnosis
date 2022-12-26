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

    // Experimental! Matrix correction - to minimize amount of unlinked nodes
    for (let i = 0; i < size; i++) {
      let edges = 0;

      for (let j = i; j < size; j++) {
        edges += (res[i][j] === PRESENT) ? 1 : 0;
      }
      if (edges <= 1) {
        const sample = RandomService.randomSample(size, size * NODE_LINK_PROBABILITY - edges);
        sample.filter(number => number !== i).forEach(number => {
          res[i][number] = PRESENT;
          res[number][i] = PRESENT;
        });
      }
    }

    return res;
  }

  public static randomInt(minInclusive: number, maxExclusive: number): number {
    return Math.floor(minInclusive + Math.random() * (maxExclusive - minInclusive));
  }

  public static randomSample(size: number, count: number): number[] {
    const bucket = [...new Array(size).keys()];
    const result = [];

    while (result.length < count) {
      let index = Math.floor(Math.random() * bucket.length);
      result.push(bucket.splice(index, 1)[0]);
    }

    return result;
  }
}
