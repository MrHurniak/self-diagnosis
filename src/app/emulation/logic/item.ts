import { IDS_DELIMITER } from '../../_@shared/utils/constants';

export class Item {

  public id;
  public active = true;
  public links: Item[] = [];

  private _info;

  constructor(id1: number, id2?: number) {
    if (!id2) {
      this.id = `${id1}`
      return;
    }
    this.id = `${id1}${IDS_DELIMITER}${id2}`
  }


  info(id: string): void {
    this._info = {
      id
    };
    return;
  }

  pass(): Item[] {
    if (!this.active) {
      return [];
    }
    console.log('pass', this.id);

    for (let link of this.links) {
      link.info(this.id);
    }

    return this.links
      .filter(link => !this._info || link.id != this._info.id)
  }
}
