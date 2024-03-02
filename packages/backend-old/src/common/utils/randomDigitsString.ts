export function randomDigitsString(length: number = 4): string {
  const str: number[] = new Array<number>()
  for (let i = 1; i <= length; i++) {
    str.push(Math.round(Math.random() * 9))
  }

  return str.join('')
}
