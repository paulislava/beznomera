export const classnames = (...classes: (string | undefined)[]): string =>
  classes.filter(classString => classString !== undefined).join(' ')
