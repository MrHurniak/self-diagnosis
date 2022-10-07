import { ItemType } from './logic/emulation.types';

export interface GraphEvent {
  id?: string,
  target: ItemType,
  type: 'add' | 'delete' | 'toggle',
}
