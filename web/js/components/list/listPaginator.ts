import { ElementList, ElementList_Options } from "./list.js";
import { Pagination, PaginationOptions } from "../pagination.js";

export interface PaginationOptionsSemi {
  elements: {
    prev: HTMLButtonElement;
    next: HTMLButtonElement;
    list: HTMLDivElement;
  };
  page: number;
  pageSize: number;
  maxButtons: number;
  classes: {
    page: string;
    dots: string;
    selected: string;
    disabled: string;
  };
}

export class ElementListPaginator<
  T extends unknown = unknown,
  K extends HTMLElement = HTMLDivElement
> extends ElementList<T, K> {
  private pagination: Pagination<T>;

  constructor(
    parent: HTMLDivElement,
    url: string,
    options: ElementList_Options & PaginationOptionsSemi
  ) {
    super(parent, url, options);
    this.pagination = new Pagination<T>({
      ...options,
      data: [],
      onPageChange: (page: number) => {
        this._execPipes("page:change", page);
      },
    });
  }


  protected _render() {
    if (this.template === null) {
      throw new ReferenceError("`template` is not defined.");
    }

    const elms: K[] = [];

    this.pagination.setData(this.data);
    const pagedData = this.pagination.getPageData();

    for (const oneData of pagedData.sort(this.orderByFunction).slice()) {
      elms.push(this._renderElement(oneData));
    }

    return elms
  }

  async _reRender() {
    if (this.isLoading) return this.data;
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

    return this.data;
  }

  setPage(page: number) {
    this.pagination.setPage(page);
    this._reRender();
  }
}
