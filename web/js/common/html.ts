export function query<T extends HTMLElement = HTMLElement>(
  str: string,
  parent: Document | HTMLElement = document
): T {
  return parent.querySelector<T>(str);
}

export function queryAll<T extends HTMLElement = HTMLElement>(
  str: string,
  parent: Document | HTMLElement = document
): T[] {
  return Array.from<T>(parent.querySelectorAll<T>(str));
}

export function createElement<T extends HTMLElement = HTMLElement>(
  tag: string
): T {
  return <T>document.createElement(tag);
}

export interface middlewareEvents_return {
  removeAll(): void;
  add(...args: any[]): void;
  rem(...args: any[]): void;
  eventNames: string[];
  events: {
    [event: string]: Function[];
  };
}

export function middlewareEvents(
  element: HTMLElement
): middlewareEvents_return {
  const original_a = element.addEventListener;
  const original_r = element.removeEventListener;
  let eventNames: string[] = [];
  const events: { [k: string]: Function[] } = {};

  element.addEventListener = function (...args: any[]) {
    const name: string = args[0];
    const listener: Function = args[1];

    if (events[name] == null) events[name] = [];
    if (!events[name].includes(listener)) events[name].push(listener);

    eventNames = Object.keys(events);

    original_a.call(element, ...args);
  };

  element.removeEventListener = function (...args: any[]) {
    const name: string = args[0];
    const listener: Function = args[1];

    if (events[name] == null) events[name] = [];
    events[name].filter((_) => _ !== listener);
    if (events[name].length === 0) events[name] = undefined;

    eventNames = Object.keys(events);

    original_r.call(element, ...args);
  };

  return {
    removeAll() {
      for (const ev of eventNames)
        for (const fn of events[ev]) {
          // @ts-ignore
          element.removeEventListener(ev, fn);
        }
    },

    add: element.addEventListener,
    rem: element.removeEventListener,

    get eventNames() {
      return eventNames.slice(0);
    },

    get events() {
      return events;
    },
  };
}

export interface htmlElementStruct {
  elm?: string;
  classes?: string[];
  attrs?: {
    [attribute: string]: string;
  };
  childs?: (htmlElementStruct | string)[];
}

export interface jsonHtml<T extends HTMLElement = HTMLElement> {
  readonly dom: T;
  readonly elm: string;
  readonly classes: DOMTokenList;
  readonly attrs: {
    [attribute: string]: string;
  };
  readonly events: middlewareEvents_return;
  readonly hasChilds: boolean;
  readonly childs: jsonHtml<HTMLElement>[];
  readonly _: {
    [element: string]: jsonHtml<HTMLElement>;
  };

  addChild<T extends HTMLElement = HTMLElement>(child: T): jsonHtml<T>;
  setAttr(name: string, value?: string): jsonHtml<T>;
  remAttr(name: string): jsonHtml<T>;
}

export function structureCopy<T extends HTMLElement>(element: T): jsonHtml<T> {
  const me: jsonHtml<T> = {
    dom: element,
    elm: element.nodeName.toLowerCase(),
    classes: element.classList,
    attrs: {},
    events: middlewareEvents(element),
    hasChilds: element.hasChildNodes(),
    childs: [],
    _: {},
    // @ts-ignore
    addChild() {},
  };

  me.setAttr = function (name: string, value: string = "true") {
    me.attrs[name] = value;
    me.dom.setAttribute(name, value);
    return me;
  };

  me.remAttr = function (name: string) {
    delete me.attrs[name];
    me.dom.removeAttribute(name);
    return me;
  };

  me.addChild = function <T extends HTMLElement = HTMLElement>(
    child: T
  ): jsonHtml<T> {
    if (child.nodeName === "#text") {
      throw new TypeError("Child is a text");
    }

    const tag = child.nodeName.toLowerCase();
    const name = child.dataset.name || null;
    const prop = name || tag;
    const sameTags = Object.keys(me._).filter(
      (_) => _.match(new RegExp(`^${prop}\d*$`)) !== null
    );

    const structure = structureCopy<T>(child);

    me._[prop + (sameTags.length || "")] = structure;

    me.childs.push(structure);
    me.dom.appendChild(structure.dom);

    return structure;
  };

  /*—————— Attributes ——————*/
  const attributeNames = element.getAttributeNames();
  for (const attr of attributeNames) {
    me.attrs[attr] = element.getAttribute(attr);
  }

  /*—————— Childs ——————*/
  if (me.hasChilds) {
    const childs = <HTMLElement[]>Array.from(element.childNodes);

    for (const child of childs) {
      try {
        me.addChild(child);
      } catch {}
    }
  }

  return me;
}

export function getElementFromString<T extends HTMLElement = HTMLElement>(
  str: string
): T {
  const element = document.createElement("div");
  element.innerHTML = str;
  return <T>element.firstElementChild;
}

export function getElementFromJSON<T extends HTMLElement = HTMLElement>(
  json: htmlElementStruct
): jsonHtml<T> {
  const element = createElement<T>(json.elm);
  if (json.classes) {
    for (const cls of json.classes) if(cls !== "") element.classList.add(cls);
  }

  if (json.attrs) {
    for (const attr in json.attrs) element.setAttribute(attr, json.attrs[attr]);
  }

  if (json.childs) {
    for (const child of json.childs) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(getElementFromJSON(child).dom);
      }
    }
  }

  return structureCopy<T>(element);
}

interface Position2D {
  x: number;
  y: number;
}

export function getAbsolutePosition(element: HTMLElement): Position2D {
  const arr: Position2D[] = [];
  let last: HTMLElement = element;

  while (true) {
    console.log([last]);
    if(last == null) break;
    const pos: TransformStyles = getTranslateValues(last);

    arr.push({
      x: last.offsetLeft + last.scrollLeft + pos.translate.x,
      y: last.offsetTop - last.scrollTop - pos.translate.y,
    });

    last = <HTMLElement>last.offsetParent;
  }

  return arr.reduce(
    (prev: Position2D, curr: Position2D): Position2D => {
      return { x: prev.x + curr.x, y: prev.x + curr.y };
    },
    { x: 0, y: 0 }
  );
}

interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface TransformStyles {
  translate: Position3D;
  rotate: Position3D;
  scale: Position3D;
}



export function getTranslateValues(element: HTMLElement): TransformStyles {
  const style = window.getComputedStyle(element);
  const matrix =
  // @ts-ignore
    style["transform"] || style.webkitTransform || style.mozTransform;

  // No transform property. Simply return 0 values.
  if (matrix === "none" || typeof matrix === "undefined") {
    return {
      translate: { x: 0, y: 0, z: 0 },
      rotate: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };
  }

  // Can either be 2d or 3d transform
  const matrixType: "2d" | "3d" = matrix.includes("3d") ? "3d" : "2d";
  const matrixValues: number[] = matrix
    .match(/matrix.*\((.+)\)/)[1]
    .split(", ")
    .map(parseFloat);
  
  let translate: Position3D = { x: 0, y: 0, z: 0 };

  if (matrixType === "2d") {
    translate = {
      x: matrixValues[4],
      y: matrixValues[5],
      z: 0,
    };
  } else if (matrixType === "3d") {
    translate = {
      x: matrixValues[12],
      y: matrixValues[13],
      z: matrixValues[14],
    };
  }

  let rotate: Position3D = { x: 0, y: 0, z: 0 };

  if (matrixType === "2d") {
    rotate = {
      x: matrixValues[1],
      y: matrixValues[2],
      z: 0,
    };
  } else if (matrixType === "3d") {
    rotate = {
      x: matrixValues[4],
      y: matrixValues[5],
      z: matrixValues[6],
    };
  }

  let scale: Position3D = { x: 0, y: 0, z: 0 };

  if (matrixType === "2d") {
    scale = {
      x: matrixValues[0],
      y: matrixValues[3],
      z: 0,
    };
  } else if (matrixType === "3d") {
    scale = {
      x: matrixValues[0],
      y: matrixValues[5],
      z: matrixValues[10],
    };
  }

  return {
    translate,
    rotate,
    scale,
  };
}
