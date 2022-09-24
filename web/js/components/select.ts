
export type SelectOption = string | [string, string];
export interface SelectOptions {
    dom: HTMLSelectElement;
    options: SelectOption[];
    selected?: string | number;
}

export default class Select {

  element: HTMLSelectElement;
  private options: SelectOption[];

  addEventListener(type: string, listener: Function) {}
  removeEventListener(type: string, listener: Function) {}

  /**
   * @example
   * const select = new Select({ ... });
   */
  constructor(options: SelectOptions) {
    this.element = options.dom;
    
    this.setOptions(options.options);

    this.select(options.selected ?? 0);

    this.addEventListener = options.dom.addEventListener.bind(options.dom);
    this.removeEventListener = options.dom.removeEventListener.bind(options.dom);
  }

  select(id: number | string) {
    if(this.options.length === 0) return;

    if(typeof id === "number") {
      this.element.selectedIndex = id;
    } else {
      let i = 0;
      this.options.find((option, _i) => {
        const is = typeof option === "string" ?
          option === id :
          option[1] === id;

        if(is) i = _i;
        return is;
      });

      console.log(i);

      this.element.selectedIndex = i;
    }
  }

  setOptions(options: SelectOption[]) {
    this.element.innerHTML = "";
    this.options = options;

    for(const option of options) {
      const dom = document.createElement("option");
      if(typeof option === "string") {
        dom.innerHTML = option;
        dom.value = option;
      } else {
        dom.innerHTML = option[0];
        dom.value = option[1];
      }
      
      this.element.append(dom);
    }
  }

  get selectedIndex(): number {
    return this.element.selectedIndex;
  }

  get selectedValue(): string {
    const t = this.options[this.selectedIndex];
    return typeof t === "string" ? t : t[1];
  }
}
