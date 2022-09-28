import { Injectable } from '@angular/core';

@Injectable()
export class MatrixService {

  public createNode(matrix: string[][]): string[][] {
    const tmp = [];
    for (let i = 0; i < matrix.length; i++) {
      matrix[i].push('0');
      tmp.push('0');
    }
    tmp.push('0')
    matrix.push(tmp);
    return this.copy(matrix)
  }

  public deleteNode(matrix: string[][],
                    id: number): string[][] {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
      if (i === id) {
        continue;
      }
      const tmp = [];
      for (let j = 0; j < matrix[i].length; j++) {
        if (j !== id) {
          tmp.push(matrix[i][j]);
        }
      }
      result.push(tmp);
    }

    return result;
  }

  public deleteEdge(matrix: string[][],
                    id1: number, id2: number): string[][] {
    return this.fillEdge(matrix, id1, id2, '0');

  }

  public createEdge(matrix: string[][],
                    id1: number, id2: number): string[][] {
    return this.fillEdge(matrix, id1, id2, '1');
  }

  private fillEdge(matrix: string[][],
                   id1: number, id2: number, value: string) {
    matrix[id1][id2] = value;
    matrix[id2][id1] = value;
    return this.copy(matrix);
  }

  private copy<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }
}
