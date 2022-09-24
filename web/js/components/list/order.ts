import ElementList, { ElementList_Options } from "./list.js";

const Events: typeof ElementList.Events = ElementList.Events;

export interface OrdenedElementList_Options extends ElementList_Options {
  autoRefresh: boolean;
}

const DefaultOptions: OrdenedElementList_Options = {
  idTarget: "uuid",
  autoRefresh: true,
};

export class OrdenedElementList<
  T extends any = any,
  K extends HTMLElement = HTMLDivElement
> extends ElementList<T, K> {
  static NO_URL: string = "NOURL";

  protected _options: OrdenedElementList_Options;

  constructor(
    parent: HTMLDivElement,
    url: string = OrdenedElementList.NO_URL,
    options?: OrdenedElementList_Options
  ) {
    super(parent, url, options);
    this._options = Object.assign({}, DefaultOptions, options);

    if (typeof url === "undefined" || url === OrdenedElementList.NO_URL) {
      this.refresh = this.__refresh;
    }
  }

  protected _generateCtx(data: T, elm: HTMLElement, template: HTMLElement): Object {
    const _this: this = this;
    return {
      data, 
      template,
      element: elm,
      list: this,
      parent: this.parent,
      fn: {
        delete: _this.delete.bind(_this, data),
        goUp: _this.goUp.bind(_this, data),
        goDown: _this.goDown.bind(_this, data)
      },
      custom: this._customFunctions,
      usePipe: this.__usePipe.bind(this)
    };
  }

  private async __refresh(): Promise<T[]> {
    if (this.isLoading) return this.data;
    this._execPipes("refresh:start");
    this.isLoading = true;

    this.parent.classList.remove("no-data");
    this.parent.classList.add("loading");
    this.parent.innerHTML = "Loading...";

    const elements: K[] = this._render();

    if (elements.length === 0) {
      this.parent.innerHTML = "No data";
      this.parent.classList.add("no-data");
    } else {
      this.parent.innerHTML = "";
      this.parent.append(...elements);
    }

    this.parent.classList.remove("loading");

    this.isLoading = false;
    this._execPipes("refresh:end");
    return this.data;
  }

  getIndex(elm: T | number): number {
    if (typeof elm === "number") return elm;
    return this.data.indexOf(elm);

  }

  /**
   * Search index of Target and send it one index to up.
   * @param elm Target
   */
  goUp(elm: T): T[];

  /**
   * Send Target one index to up.
   * @param elm Target
   */
  goUp(elm: number): T[];
  goUp(elm: T | number): T[] {
    const elmIndex = this.getIndex(elm);
    if (elmIndex < 0) return this.data;
    const [tmp] = this.data.splice(elmIndex, 1);
    this.data.splice(elmIndex - 1, 0, tmp);

    return this._returnDataAndRefresh();
  }

  /**
   * Search index of Target and send it one index to down.
   * @param elm Target
   */
  goDown(elm: T): T[];

  /**
    * Send Target one index to down.
    * @param elm Target
    */
  goDown(elm: number): T[];
  goDown(elm: T | number): T[] {
    const elmIndex = this.getIndex(elm);
    if (elmIndex < 0) return this.data;
    const [tmp] = this.data.splice(elmIndex, 1);
    this.data.splice(elmIndex + 1, 0, tmp);
    
    return this._returnDataAndRefresh();
  }

  add(elm: T): T[] {
    this.data.push(elm);
    this.cache[elm[this._options.idTarget]] = elm;

    return this._returnDataAndRefresh();
  }

  /**
   * Delete target from data
   * @param elm Target
   */
  delete(elm: T | number): T[] {
    const elmIndex = this.getIndex(elm);
    if (elmIndex < 0) return this.data;
    this.data.splice(elmIndex, 1);

    return this._returnDataAndRefresh();
  }

  deleteAll(): T[] {
    this.data = [];
    return this._returnDataAndRefresh();
  }

  private _returnDataAndRefresh() {
    if (this._options.autoRefresh) this.refresh();
    return this.data;
  }
}
