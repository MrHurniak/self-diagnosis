import { EventEmitter, Injectable } from '@angular/core';
import { PRESENT } from '../../_@shared/utils/constants';
import { RandomService } from '../../_@shared/services/random.service';
import { Item, Node, Edge } from './item';

export interface State {
  started: boolean,
  paused: boolean,
}

export interface Processing {
  id: string,
  value: boolean,
}

@Injectable()
export class EmulationService {

  public readonly processing = new EventEmitter<Processing>();
  public readonly stateChange = new EventEmitter<State>();

  private state: State = {
    started: false,
    paused: false,
  };

  private nodes: Node[] = [];
  private edges: Edge[] = [];

  constructor(
    private random: RandomService
  ) { }

  public pause(): void {
    this.state.paused = !this.state.paused;
    this.publishState();
  }

  public stop(): void {
    this.state.started = false;
    this.state.paused = true;
    this.nodes = [];
    this.edges = [];
    this.publishState();
  }

  public toggle(id: string, type: 'node' | 'edge'): void {
    const items: Item[] = type === 'node' ? this.nodes : this.edges;
    const item = items.find(item => item.id === id);

    if (item) {
      item.active = !item.active;
    } else {
      console.error('No item with such id ', id, ' and type ', type);
    }
  }

  public start(matrix: string[][],
               disabledNodes: string[], disabledEdges: string[]): void {
    this.state.started = true;
    this.state.paused = false;
    this.publishState();

    // initialization
    this.createNodes(matrix);
    this.createEdges(matrix);
    this.disable(disabledNodes, disabledEdges);

    // start
    const id = this.random.randomInt(0, matrix.length - 1);
    this.nodes[id].pass(null, null);
  }

  private publishState(): void {
    this.stateChange.emit(this.state);
  }

  private createNodes(matrix: string[][]): void {
    for (let i = 0; i < matrix.length; i++) {
      let node = new Node(i, this.state, this.processing);
      this.nodes.push(node);
    }
  }

  private createEdges(matrix: string[][]): void {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i; j < matrix[i].length; j++) {
        if (i === j) continue;

        if (matrix[i][j] === PRESENT) {
          const node1 = this.nodes[i];
          const node2 = this.nodes[j];
          const edge = new Edge(i, j, this.state, this.processing);
          edge.links.push(node1, node2);
          node1.links.push(edge);
          node2.links.push(edge);
          this.edges.push(edge);
        }
      }
    }
  }

  private disable(disabledNodes: string[], disabledEdges: string[]): void {
    disabledNodes.forEach(id => this.toggle(id, 'node'));
    disabledEdges.forEach(id => this.toggle(id, 'edge'));
  }
}
