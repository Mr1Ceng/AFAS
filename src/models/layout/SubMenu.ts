import { SubMenuItem } from './SubMenuItem'
export class SubMenu {
  public key: string;
  public name: string;
  public items: SubMenuItem[];

  constructor(key: string, name: string);
  constructor(key: string, name?: string, items?: SubMenuItem[]) {
    this.key = key;
    this.name = name ?? "";
    this.items = items ?? [];
  }
}