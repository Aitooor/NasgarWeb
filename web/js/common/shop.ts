export function monetize(money: number): string {
  if (typeof money !== "number") return "0.00";
  const moneyStr = money.toLocaleString("en");
  const sep = moneyStr.split(".");
  const cents =
    sep.length === 1 ? "00" : sep[1].length === 1 ? sep[1] + "0" : sep[1];
  return sep[0] + "." + cents;
}

export function wait(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

export function capitalize(str: string): string {
  if (str.length === 0) return str;

  const _s = str.split("");
  _s[0] = _s[0].toUpperCase();
  return _s.join("");
}

export function stringSort(down = false) {
  return (a: string, b: string) => {
    const maxLength = Math.max(a.length, b.length);

    for (let i = 0; i < maxLength; i++) {
      if (a[i] == b[i]) continue;
      if (a[i] == undefined) return 1;
      if (b[i] == undefined) return -1;

      const _a = a.charCodeAt(i);
      const _b = b.charCodeAt(i);

      if (down) return _b - _a;
      return _a - _b;
    }

    return 0;
  };
}

export function applyFilter<T = {}>(
  arr: Array<T>,
  name: keyof T,
  filter: number | string
) {
  if (typeof filter === "number") {
    if (filter === 0) return;

    const down = filter < 0;

    const fn_str = stringSort(down);

    return arr.sort((_a, _b) => {
      const a = _a[name];
      const b = _b[name];

      if (typeof a === "string" && typeof b === "string") return fn_str(a, b);

      if (typeof a === "number" && typeof b === "number")
        return down ? b - a : a - b;
    });
  } else if (typeof filter === "string") {
    const reg = new RegExp(`^${filter}$`, "i");
    return arr.filter((_a) => {
      const a = _a[name];

      if (typeof a !== "string") return false;

      return reg.test(a);
    });
  }
}

/**
 * @param {Array} arr
 * @param {{ [key: string]: number | string }} filters
 */
export function applyFilters(arr, filters) {
  if (arr.length === 0) return arr;

  return arr;
}
