const pluralCases = [2, 0, 1, 1, 1, 2];

/**
 * Функция для склонения числительных
 * @param number Число
 * @param titles Массив из форм склонения в формате: [яблоко, яблока, яблок]
 * @returns Число и числительное в нужном склонении
 */
export function pluralize(number: number, titles: [string, string, string]) {
  return `${number} ${
    titles[
      number % 100 > 4 && number % 100 < 20 ? 2 : pluralCases[number % 10 < 5 ? number % 10 : 5]
    ]
  }`;
}
