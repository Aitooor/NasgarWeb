import { queryAll } from "../../common/html.js";

export interface ElementList_Options {
  idTarget?: string;
}

const DefaultElementList_Options: ElementList_Options = {
  idTarget: "uuid",
};

export interface ElementList_Cache<T extends any> {
  [id: string]: T;
}

enum Events {
  Refresh = "refresh",
  Render = "render",
  TemplateClick = "template_click",
}

type Events_type = "refresh" | "render" | "template_click";

type Listener<G, T, K> =
  | ((_this: G) => void)
  | ((_this: G, r: boolean) => void)
  | ((_this: G, element: K, data: T) => void);

type ClickEvent<G, T, K> = (_this: G, element: K, data: T) => void;

type CustomFunctions = { [key: string]: Function };

type PipeFunction = (method: string, ...args: any[]) => void;

export class ElementList<
  T extends any,
  K extends HTMLElement = HTMLDivElement
> {
  protected data: T[] = [];
  protected cache: ElementList_Cache<T> = {};

  protected _options: ElementList_Options;

  protected template: K = null;

  public isLoading: boolean = false;

  protected _customFunctions: CustomFunctions = {};

  static Events: typeof Events = Events;
  public Events: typeof Events = Events;

  protected _pipes: PipeFunction[] = [];

  protected _onclickEvent: ClickEvent<this, T, K> = null;

  protected orderByFunction: (a: T, b: T) => number = (a, b) => { return 0; };

  constructor(
    public parent: HTMLDivElement,
    protected url: string,
    options: ElementList_Options = DefaultElementList_Options
  ) {
    this._options = Object.assign({}, DefaultElementList_Options, options);
  }

  setOrderByFunction(fn: (a: T, b: T) => number): this {
    this.orderByFunction = fn;
    return this;
  }

  setTemplate(template: string | K): this {
    if (typeof template === "string") {
      const temp = document.createElement("div");
      temp.innerHTML = template;
      this.template = <K>temp.firstElementChild;
    } else {
      this.template = <K>template.cloneNode(true);
    }

    return this;
  }

  getTemplate(): K {
    return this.template;
  }

  getData(): T[] {
    return this.data.slice(0);
  }
  getCache(): ElementList_Cache<T> {
    return Object.assign({}, this.cache);
  }

  setCustomFunctions(fn: CustomFunctions): this {
    this._customFunctions = fn;
    return this;
  }

  /*******************************/
  /***         Methods         ***/
  /*******************************/

  /**
   * No implemented.
   * @deprecated Use `pipe` instead.
   */
  on(name: Events_type, listener: Listener<this, T, K>): this {
    return this;
  }

  setOnClick(listener: ClickEvent<this, T, K>): this {
    this._onclickEvent = listener;
    return this;
  }

  protected _generateCtx(
    data: T,
    elm: HTMLElement,
    template: HTMLElement
  ): any {
    return {
      data,
      template: template,
      element: elm,
      list: this,
      parent: this.parent,
      custom: this._customFunctions,
      usePipe: this.__usePipe.bind(this),
    };
  }

  protected _setEventsOnElement(elm: HTMLElement, data: T): HTMLElement {
    const selectedElements: HTMLElement[] = queryAll(
      "*[data-slot-events]",
      elm
    );

    for (const element of selectedElements) {
      const events: string[] = element.dataset.slotEvents.split(/\s*,\s*/);
      element.removeAttribute("data-slot-events");
      const ctx = this._generateCtx(data, element, elm);

      for (const fn in ctx.custom) {
        ctx.custom[fn] = ctx.custom[fn].bind(ctx);
      }

      for (const event of events) {
        const fn_ = element.dataset[`on${event}`];
        if (typeof fn_ === "string") {
          element.removeAttribute(`data-on${event}`);
          const fn = new Function(fn_).bind(ctx, ctx);

          element.addEventListener(event, () => fn());
        }
      }
    }

    return elm;
  }

  protected _renderElement(data: T): K {
    if (this.template === null) {
      throw new ReferenceError("`template` is not defined.");
    }

    const elm: K = <K>this.template.cloneNode(true);
    const _tmpParent = document.createElement("div");
    _tmpParent.appendChild(elm);
    const allElementsWithSlot: HTMLElement[] = queryAll("*[slot]", _tmpParent);
    
    for (const elmWithSlot of allElementsWithSlot) {
      const slot: string = elmWithSlot.getAttribute("slot");

      const hasSlotFormatter: boolean = elmWithSlot.hasAttribute(
        "data-slot-formatter"
      );
      const slotFormatter: string = elmWithSlot.dataset.slotFormatter;

      const hasSlotAttribute: boolean = elmWithSlot.hasAttribute(
        "data-slot-attribute"
      );
      const slotAttribute: string = elmWithSlot.dataset.slotAttribute;

      elmWithSlot.removeAttribute("slot");

      if (hasSlotFormatter) elmWithSlot.removeAttribute("data-slot-formatter");
      if (hasSlotAttribute) elmWithSlot.removeAttribute("data-slot-attribute");

      const prop: string = getFromProperty<T, string>(data, slot);
      const formatted: string = hasSlotFormatter
        ? this._customFunctions[slotFormatter](prop)
        : prop;

      if (hasSlotAttribute) {
        elmWithSlot.setAttribute(slotAttribute, formatted);
      } else if (elmWithSlot instanceof HTMLInputElement) {
        elmWithSlot.value = formatted;
      } else {
        elmWithSlot.innerHTML = formatted;
      }
    }

    this._setEventsOnElement(elm, data);

    elm.addEventListener("click", () => {
      if (this._onclickEvent !== null) this._onclickEvent(this, elm, data);
    });

    return elm;
  }

  protected _render(): K[] {
    if (this.template === null) {
      throw new ReferenceError("`template` is not defined.");
    }

    const elms: K[] = [];

    for (const oneData of this.data.sort(this.orderByFunction)) {
      elms.push(this._renderElement(oneData));
    }

    return elms;
  }

  async refresh(): Promise<T[]> {
    if (this.isLoading) return this.data;
    this.isLoading = true;

    this.parent.classList.remove("no-data");
    this.parent.classList.add("loading");
    this.parent.innerHTML = "Loading...";

    await this.refreshData();

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

    return this.data;
  }

  protected async refreshData(): Promise<T[] | null> {
    const response = await fetch(this.url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    if (!response.ok) {
      alert(`Error fetching data to '${this.url}'.`);
      return null;
    }

    const json = await response.json();

    this.data = json;
    this.cache = this.data.reduce((prev, acc) => {
      prev[acc[this._options.idTarget]] = acc;
      return prev;
    }, {});

    return this.data;
  }

  protected _execPipes: PipeFunction = (method: string, ...args: any[]) => {
    for (const pipe of this._pipes) {
      pipe(method, ...args);
    }
  };

  /**
   * Execute a custom pipe, should be starts with "custom:"
   */
  protected __usePipe(method: string, ...args: any[]): void {
    if (!method.startsWith("custom:") && method.length < 8) return;
    this._execPipes(method, ...args);
  }

  clearPipes() {
    this._pipes = [];
  }

  pipe(fn: PipeFunction): this {
    this._pipes.push(fn);
    return this;
  }
}
export default ElementList;

function getFromProperty<T extends Object = Object, K extends any = any>(
  obj: T,
  propStr: string
): K {
  const props = propStr.split(".");
  let last: any = obj;

  for (const prop of props) {
    if (typeof last === "undefined")
      throw new ReferenceError(`Property doesn't exists.`);
    last = last[prop];
  }

  return <K>last;
}
