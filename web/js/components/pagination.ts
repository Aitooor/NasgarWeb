import {
  createElement,
  getElementFromJSON,
  htmlElementStruct,
} from "../common/html.js";

export interface PaginationOptions<T> {
  data: T[];
  elements: {
    prev: HTMLButtonElement;
    next: HTMLButtonElement;
    list: HTMLDivElement;
  };
  page?: number;
  pageSize?: number;
  maxButtons?: number;
  classes?: {
    page?: string;
    dots?: string;
    selected?: string;
    disabled?: string;
  };

  onPageChange?: (page: number) => void;
}

export class Pagination<T> {
  private readonly options: PaginationOptions<T>;
  private data: T[];
  constructor(options: PaginationOptions<T>) {
    this.options = Object.assign(
      {
        data: [],
        page: 0,
        pageSize: 10,
        maxButtons: 10,
        classes: {
          page: "page",
          dots: "dots",
          selected: "selected",
          disabled: "disabled",
        },
      } as PaginationOptions<T>,
      options
    );

    this.data = this.options.data;
    this._render();

    this.options.elements.prev.addEventListener("click", () => {
      this.prev();
    });

    this.options.elements.next.addEventListener("click", () => {
      this.next();
    });
  }

  prev() {
    if (this.options.page > 0) {
      this.options.onPageChange?.(this.options.page - 1);
    }
  }

  next() {
    if (this.options.page < this.getPageCount() - 1) {
      this.options.onPageChange?.(this.options.page + 1);
    }
  }

  _render() {
    const {
      elements: { prev, next, list },
      page,
      pageSize,
      maxButtons,
      classes,
    } = this.options;
    const data = this.data;
    const start = page * pageSize;
    const end = start + pageSize;

    const pages = this.getPageCount();
    const buttons = Math.min(pages, maxButtons);

    const pagesList = [];
    for (let i = 0; i < buttons; i++) {
      const elm = getElementFromJSON({
        elm: "button",
        classes: [classes.page, i === page ? classes.selected : ""],
        attrs: {
          "data-page": i.toString(),
        },
        childs: [`${i + 1}`],
      });

      elm.events.add("click", () => {
        this.options.onPageChange?.(i);
      });
      
      pagesList.push(elm.dom);
    }

    list.innerHTML = "";
    list.append(...pagesList);

    // Disable/Enable next/prev buttons
    if (page === 0) {
      prev.classList.add(classes.disabled);
      prev.setAttribute("disabled", "true");
    } else {
      prev.classList.remove(classes.disabled);
      prev.removeAttribute("disabled");
    }
    if (page === pages - 1) {
      next.classList.add(classes.disabled);
      next.setAttribute("disabled", "true");
    } else {
      next.classList.remove(classes.disabled);
      next.removeAttribute("disabled");
    }
  }

  setData(data: T[]) {
    this.data = data;
    this._render();
  }

  getPageData(): T[] {
    const start = this.options.page * this.options.pageSize;
    const end = start + this.options.pageSize;

    return this.data.slice(start, end);
  }

  setPage(page: number) {
    this.options.page = page;
    this._render();
  }

  getPageCount() {
    return Math.ceil(this.data.length / this.options.pageSize);
  }
}
