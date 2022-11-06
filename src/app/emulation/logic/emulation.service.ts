import { EventEmitter, Injectable } from '@angular/core';
import { PRESENT } from '../../_@shared/utils/constants';
import { Edge, Item, Node } from './item';
import { ItemType, ProcessingEventType } from './emulation.types';
import { MatrixService } from '../../_@shared/services/matrix.service';
import { SyndromeAnalyzer } from './syndrome-analyzer.service';
import { COEFFICIENT_OF_SUFFICIENCY } from '../../_@shared/utils/configs';

export interface State {
  started: boolean,
  paused: boolean,
}

export interface Processing {
  id: string,
  value: boolean,
  type: ProcessingEventType,
}

export interface DiagnosticResult {
  result: string[][],
  invalidNodes: string[],
}

export interface DiagnosticInternalResult {
  nodeId: string,
  result: string[][],
}

@Injectable()
export class EmulationService {

  public readonly processing = new EventEmitter<Processing>();
  public readonly stateChange = new EventEmitter<State>();
  public readonly diagnosticResult = new EventEmitter<DiagnosticResult>();
  private diagnosticInternalResult = new EventEmitter<DiagnosticInternalResult>();

  private state: State = {
    started: false,
    paused: false,
  };

  private nodes: Node[] = [];
  private edges: Edge[] = [];

  constructor(
    private analyzer: SyndromeAnalyzer,
  ) {
    this.diagnosticInternalResult.subscribe(info => {
      this.diagnosticResult.emit({
        result: info.result,
        invalidNodes: this.findInvalid(info.result),
      });
    });
  }

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

  public toggle(id: string, type: ItemType): void {
    const items: Item[] = (type === 'node') ? this.nodes : this.edges;
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
    this.nodes.forEach(node => node.process());
  }

  private publishState(): void {
    this.stateChange.emit(this.state);
  }

  private createNodes(matrix: string[][]): void {
    const initValue = {
      counter: COEFFICIENT_OF_SUFFICIENCY * matrix.length,
      matrix: MatrixService.initEmptyMatrix(matrix.length),
    };

    for (let i = 0; i < matrix.length; i++) {
      let node = new Node(i,
        initValue,
        this.state,
        this.processing,
        this.diagnosticInternalResult
      );
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
          edge.nodes.push(node1, node2);
          node1.edges.push(edge);
          node2.edges.push(edge);
          this.edges.push(edge);
        }
      }
    }
  }

  private disable(disabledNodes: string[], disabledEdges: string[]): void {
    disabledNodes.forEach(id => this.toggle(id, 'node'));
    disabledEdges.forEach(id => this.toggle(id, 'edge'));
  }

  private findInvalid(result: string[][]): string[] {
    return Array.from(this.analyzer.analyze(result),
      ([name, value]) => (`${name}: ${value}`));
  }
}
