import {
  ERROR,
  IDS_DELIMITER,
  PRESENT,
  UNKNOWN
} from '../../_@shared/utils/constants';

export interface Item {
  id: string;
  active: boolean;
  info(id: string, result: string[][]): void;
  pass(): Item[];
  isActive(): boolean;
}

export class Node implements Item {

  public id;
  public active = true;
  public links: Edge[] = [];

  private previousId: string = null;
  private result: string[][] = null;

  constructor(id: number) {
    this.id = `${id}`
  }

  isActive(): boolean {
    return this.active;
  }

  info(id: string, result: string[][]): void {
    this.previousId = id;
    // this.append(result); // TODO uncomment
  }

  pass(): Item[] {
    if (!this.isActive()) { // TODO check in redundancy
      return [];
    }
    console.log('pass', this.id);

    const validEdges = [];
    for (let edge of this.links) {

      if (edge.id === this.previousId) {
        continue; // !do not send back
      }

      const edgeActive = edge.isActive(); // !validity check
      if (edgeActive) {
        validEdges.push(edge);
      }
      // this.updateResult(edge, edgeActive); // TODO uncomment
    }

    for (let edge of validEdges) {
      edge.info(this.id, this.result);
    }

    return validEdges;
  }

  private updateResult(edge: Edge, active: boolean): void {
    const id1 = parseInt(this.id, 10);
    const id2Str = edge.id.split(IDS_DELIMITER).find(id => id !== this.id);
    const id2 = parseInt(id2Str, 10);

    this.result[id1][id2] = active ? PRESENT : ERROR;
  }

  private append(appender: string[][]): void {
    for (let i = 0; i < this.result.length; i++) {
      for (let j = 0; j < this.result[i].length; j++) {
        if (this.result[i][j] !== UNKNOWN) {
          continue;
        }
        this.result[i][j] = appender[i][j];
      }
    }
  }
}

export class Edge implements Item {

  public id;
  public active = true;
  public links: Node[] = [];

  private previousId;
  private result;

  constructor(id1: number, id2: number) {
    this.id = `${id1}${IDS_DELIMITER}${id2}`
  }

  info(id: string, result: string[][]): void {
    this.previousId = id;
    this.result = result;
  }

  pass(): Item[] {
    if (!this.isActive) { // TODO check
      return [];
    }
    console.log('pass', this.id);

    const validNodes = this.links.filter(node => node?.id !== this.previousId);

    console.log(validNodes);
    validNodes.forEach(node => node.info(this.id, this.result))
    return validNodes;
  }

  public isActive(): boolean {
    return this.active
      && !this.links.some(node => !node.isActive());
  }
}
