import { default as Fuse } from "../../../vendor/fusejs/fuse.js";
import { getCache, setCache } from "../../common/cache.js";
import {
  getAbsolutePosition,
  getElementFromJSON,
  getElementFromString,
  htmlElementStruct,
  jsonHtml,
  structureCopy,
} from "../../common/html.js";

const templateHtml = `
<div class="selector-list">
  <div class="selector-list__header hidden" data-name="header">
    <input type="text"/>
  </div>
  <div class="selector-list__body">
    <div class="selector-list__hint"></div>
    <div class="selector-list__selectors"></div>
    <div class="selector-list__list" data-name="list"></div>
  </div>
</div>`;

let parent: HTMLElement = getCache("selector-list-parent", null);

if (!parent) {
  parent = document.createElement("div");
  parent.className = "selector-list-parent";
  document.body.appendChild(parent);

  setCache("selector-list-parent", parent);
}

export interface RecomendedSelectorListOptionsProperties {
  style: "small" | "medium" | "large" | "fit";
  target: string;
  text: string;
  regex?: string | RegExp;
  visible?: boolean;
}

export interface RecomendedSelectorListOptions<T = any> {
  list: T[];
  properties: (string | RecomendedSelectorListOptionsProperties)[];
  hint?: string;
  target?: HTMLElement | HTMLElement[];
  useOnInput?: boolean;
  onSelect?(item: T, index: number): void;
  onClose?(): void;
}

const defaultOptions: RecomendedSelectorListOptions<any> = {
  list: [],
  properties: [],
  hint: "",
  target: document.querySelector("body"),
  useOnInput: false,
  onSelect: () => {},
  onClose: () => {},
};

export class RecomendedSelectorList<T = any> {
  element: HTMLDivElement;
  protected structure: jsonHtml<HTMLDivElement>;
  protected inputCard: jsonHtml<HTMLInputElement>;
  private options: RecomendedSelectorListOptions<T>;

  private fuse: Fuse<T>;
  private fuseByProperty: { [key: string]: Fuse<T> } = {};

  protected selectors: { [key: string]: jsonHtml<HTMLDivElement> } = {};
  protected _actualIndex: number = 0;

  protected lastMouseEvent: MouseEvent;

  isOpen: boolean = false;

  #RegExp(regex: string | RegExp): RegExp {
    if (typeof regex === "string") {
      return new RegExp(regex);
    }
    return regex;
  }

  constructor(options?: RecomendedSelectorListOptions<T>) {
    this.options = { ...defaultOptions, ...(options || {}) };
    this.options.properties = this.options.properties.map((property) => {
      if (typeof property === "string") return property;
      return {
        ...property,
        regex: this.#RegExp(property.regex),
        visible: property.visible === undefined ? true : property.visible,
      };
    });
    this.#_init();
  }

  #_init() {
    // Create structure
    this.element = getElementFromString<HTMLDivElement>(templateHtml);
    this.structure = structureCopy<HTMLDivElement>(this.element);
    this.structure.classes.remove("active");
    this.inputCard = <jsonHtml<HTMLInputElement>>(
      this.structure.childs[0].childs[0]
    );

    // Create Fuse instances
    this.setList(this.options.list);

    this.setHint(this.options.hint || "");

    // Set targets if are setted
    if (this.options.target) {
      this.setTarget(this.options.target);
    }

    // Add all event listeners to the elements
    this.inputCard.events.add("input", () => {
      this.search(this.inputCard.dom.value);
    });

    this.inputCard.events.add("blur", (e) => {
      this.close();
    });

    // Append to parent
    parent.appendChild(this.element);

    // Reload
    this._reloadSelectors();
    this.refresh();
  }

  protected _normalizeProperty(
    property: string | RecomendedSelectorListOptionsProperties
  ): RecomendedSelectorListOptionsProperties {
    if (typeof property === "string") {
      return {
        style: "fit",
        target: property,
        text: property,
        visible: true,
      };
    }

    return property;
  }

  protected _createSelector(
    property: string | RecomendedSelectorListOptionsProperties
  ) {
    const prop = this._normalizeProperty(property);
    const selector = getElementFromJSON<HTMLDivElement>({
      elm: "div",
      classes: ["selector-list__selector", prop.style],
      childs: [prop.text],
    });

    this.selectors[prop.target] = selector;

    return selector;
  }

  protected _reloadSelectors() {
    const selectors = this.structure.childs[1].childs[1];
    selectors.dom.innerHTML = "";
    selectors.childs.splice(0, selectors.childs.length);
    this.options.properties.forEach((property) => {
      if (typeof property !== "string" && !property.visible) {
        return;
      }
      const selector = this._createSelector(property);
      selectors.addChild(selector.dom);
      return selector;
    });
  }

  protected _createListItem(item: T) {
    const listItem = getElementFromJSON({
      elm: "div",
      classes: ["selector-list-item"],
      childs: this.options.properties
        .map((property) => {
          const prop = this._normalizeProperty(property);

          if (prop.visible === false) {
            return null;
          }

          return <htmlElementStruct>{
            elm: "div",
            classes: [
              "selector-list-item__column",
              prop.style === "fit" ? "" : prop.style,
            ],
            attrs:
              prop.style !== "fit"
                ? {}
                : {
                    style: `width: ${
                      this.selectors[prop.target].dom.clientWidth
                    }px`,
                  },
            childs: [item[prop.target] + ""],
          };
        })
        .filter((item) => item !== null),
    });

    listItem.events.add("click", () => {
      this.options.onSelect(item, this._actualIndex);
      this.close();
    });

    return listItem;
  }

  private _setPos() {
    const e = this.lastMouseEvent;
    const xMouse: number = e.pageX - window.scrollX;
    const yMouse: number = e.pageY - window.scrollY;

    const widthWindow: number = window.innerWidth;
    const heightWindow: number = window.innerHeight;

    const widthElement: number = this.element.offsetWidth;
    const heightElement: number = this.element.offsetHeight;

    const x = Math.min(widthWindow - widthElement - 10, xMouse);
    const y = Math.min(heightWindow - heightElement - 10, yMouse);

    this.element.style.top = `${y}px`;
    this.element.style.left = `${x}px`;
  }

  protected _loadData(data: T[]) {
    const list = this.structure.childs[1].childs[2];
    list.dom.innerHTML = "";
    list.childs.splice(0, list.childs.length);
    data.forEach((item) => {
      const listItem = this._createListItem(item);
      list.addChild(listItem.dom);
      return listItem;
    });
  }

  setHint(hint: string) {
    if (hint.length === 0) {
      this.structure.childs[1].childs[0].classes.add("hidden");
      return;
    }
    this.structure.childs[1].childs[0].classes.remove("hidden");
    this.structure.childs[1].childs[0].dom.innerHTML = hint;
  }

  setList(list: T[]) {
    this.options.list = list;
    this.fuse = new Fuse(this.options.list, {
      keys: this.options.properties.map((property) => {
        if (typeof property === "string") return property;
        return property.target;
      }),
      isCaseSensitive: false,
      includeScore: false,
      shouldSort: true,
      threshold: 0.3,
    });

    this.fuseByProperty = {};
    this.options.properties.forEach((property) => {
      if (typeof property === "string") return;

      this.fuseByProperty[property.target] = new Fuse(this.options.list, {
        keys: [property.target],
        isCaseSensitive: false,
        includeScore: false,
        shouldSort: true,
        threshold: 0.3,
      });
    });
    this.refresh();
  }

  setTarget(_target: HTMLElement | HTMLElement[]) {
    let targets: HTMLElement[] = Array.isArray(_target) ? _target : [_target];
    for (const [i, target] of targets.entries()) {
      if (this.options.useOnInput) {
        if (target.tagName !== "INPUT") {
          throw new Error("Target must be an input element");
        }
        target.addEventListener("click", (e: MouseEvent) => {
          this._open(e);
          this._actualIndex = i;
          this.search((<HTMLInputElement>target).value);
        });

        target.addEventListener("blur", () => {
          this.close();
        });
      }

      target.addEventListener("input", () => {
        this.search((<HTMLInputElement>target).value);
      });
    }

    this.options.target = targets;
  }

  setOnSelect(onSelect: (item: T, index: number) => void) {
    this.options.onSelect = onSelect;
  }

  /**
   * Refresh the list
   */
  refresh() {
    this._loadData(this.options.list);
  }

  /**
   * Show component
   */
  private _open(event?: MouseEvent) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.inputCard.dom.value = "";

    this.structure.classes.add("active");
    this.lastMouseEvent = event;
    let lastHeight = 0;
    setInterval(() => {
      if (window.innerHeight !== lastHeight) {
        this._setPos();
        lastHeight = window.innerHeight;
      }
    }, 100);
  }

  /**
   * Hide component
   */
  close() {
    this.isOpen = false;
    this.structure.classes.remove("active");
    this.options.onClose();
  }

  /**
   * Search for a string in the list and render the results
   * @param query String of query
   */
  search(query: string) {
    this.inputCard.dom.value = query;

    if (query.length === 0) {
      this.refresh();
      return;
    }

    // Select Fuse engine by property and use it to search
    let results: Fuse.FuseResult<T>[] = null;
    this.options.properties.forEach((property) => {
      if (typeof property === "string") return;
      if (property.regex && this.#RegExp(property.regex).test(query)) {
        results = this.fuseByProperty[property.target].search(query);
      }
    });

    if (!results) {
      results = this.fuse.search(query);
    }

    // Get items from results and render them
    this._loadData(results.map((_) => _.item));
  }
}
