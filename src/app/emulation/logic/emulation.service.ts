import { EventEmitter, Injectable } from '@angular/core';
import { IDS_DELIMITER, PRESENT } from '../../_@shared/utils/constants';
import { Edge, Item, Node } from './item';
import { ItemType, ProcessingEventType } from './emulation.types';
import { MatrixService } from '../../_@shared/services/matrix.service';
import { SyndromeAnalyzer } from './syndrome-analyzer.service';
import {
  ACCURACY,
  COEFFICIENT_OF_SUFFICIENCY
} from '../../_@shared/utils/configs';

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
  probability: Map<string, number>,
  meta: any
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

  private cycleStartTime;

  constructor(
    private analyzer: SyndromeAnalyzer,
  ) {
    this.diagnosticInternalResult.subscribe(info => {
      const startTime = this.cycleStartTime;
      const stopTime = Date.now();
      this.cycleStartTime = stopTime;

      this.analyzer.analyzeAsync(info.result)
        .then(p => this.publishResult(info.result, p, startTime, stopTime));
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

  public setItemActive(id: string, active: boolean, type: ItemType): void {
    const items: Item[] = (type === 'node') ? this.nodes : this.edges;
    const item = items.find(item => item.id === id);

    if (item) {
      item.active = active;
    } else {
      console.error('No item with such id ', id, ' and type ', type);
    }
  }

  public start(matrix: string[][], disabled: string[]): void {
    this.state.started = true;
    this.state.paused = false;
    this.publishState();

    // initialization
    this.createNodes(matrix);
    this.createEdges(matrix);
    this.disable(disabled);

    // start
    this.nodes.forEach(node => node.process());
    this.cycleStartTime = Date.now();
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

  private disable(disabled: string[]): void {
    disabled.forEach(id => this.setItemActive(id, false,
      id.includes(IDS_DELIMITER) ? 'edge' : 'node'));
  }

  private publishResult(result, probability, startTime, stopTime): void {
    const isCorrect = this.isAnswerCorrect(probability);
    const analysisTime = Date.now();

    this.diagnosticResult.emit({
      result,
      probability,
      meta: {
        startTime,
        stopTime,
        analysisTime,
        isCorrect,
      }
    });
  }

  private isAnswerCorrect(probability: Map<number, number>): boolean {
    for (let i = 0; i < this.nodes.length; i++) {
      const isNodeAlive = probability.get(i) > ACCURACY;
      if (this.nodes[i].active != isNodeAlive) {
        console.log(`Info about node ${i} is wrong`);
        return false;
      }
    }
    return true;
  }
}
