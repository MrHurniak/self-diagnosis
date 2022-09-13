import { Component, Input } from '@angular/core';
import { Edge, Node } from "@swimlane/ngx-graph";

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.scss']
})
export class GraphViewComponent {

  public readonly width = 700;
  public readonly height = 400;

  _edges: Edge[] = [];
  _nodes: Node[] = [];

  constructor() { }

  @Input()
  set matrix(matrix: string[][]) {
    if (!matrix.length) {
      return;
    }

    this._nodes = matrix.map((row, index) => {
      return {
        id: `${index}`,
        label: `${index}`,
      };
    });

    const tmp: Edge[] = []
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i; j < matrix[i].length; j++) {
        if (matrix[i][j] === '1') {
          tmp.push({
            id: `${i}${j}`,
            source: `${i}`,
            target: `${j}`,
          })
        }
      }
    }
    this._edges = tmp;
    console.log(this._nodes);
    console.log(tmp);
  }
}
