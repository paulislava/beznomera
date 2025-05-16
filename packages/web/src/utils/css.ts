class CssVar {
  name: string;
  var: string;

  [index: string]: string;

  constructor(name: string) {
    this.name = `--${name}`;
    this.var = `var(${this.name})`;
  }

  // @ts-expect-error toString
  public toString() {
    return this.var;
  }
}

export const cssVar = (name: string) => new CssVar(name);

export const numberToPx = (value?: number | string) =>
  value ? (typeof value === 'number' ? `${value}px` : value) : undefined;
