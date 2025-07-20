# Tailwind CSS в проекте Web

## Установка и настройка

Tailwind CSS успешно интегрирован в проект web. Конфигурация включает:

### Файлы конфигурации

- `tailwind.config.js` - основная конфигурация Tailwind CSS
- `postcss.config.js` - конфигурация PostCSS для обработки CSS
- `src/app/globals.css` - глобальные стили с директивами Tailwind

### Установленные зависимости

```json
{
  "devDependencies": {
    "tailwindcss": "^3.x.x",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x"
  }
}
```

## Использование

### Базовые классы

```tsx
// Контейнер с отступами и фоном
<div className="p-4 bg-blue-500 text-white rounded-lg">
  Контент
</div>

// Кнопка с hover эффектами
<button className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded transition-colors">
  Кнопка
</button>

// Текст с различными размерами
<h1 className="text-2xl font-bold">Заголовок</h1>
<p className="text-sm text-gray-600">Описание</p>
```

### Адаптивный дизайн

```tsx
// Разные размеры для разных экранов
<div className="w-full md:w-1/2 lg:w-1/3">
  Адаптивный контейнер
</div>

// Скрытие/показ элементов
<div className="hidden md:block">
  Видно только на средних экранах и больше
</div>
```

### Flexbox и Grid

```tsx
// Flexbox
<div className="flex items-center justify-between">
  <div>Левая часть</div>
  <div>Правая часть</div>
</div>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Элемент 1</div>
  <div>Элемент 2</div>
  <div>Элемент 3</div>
</div>
```

### Темная тема

```tsx
// Автоматическое переключение темы
<div className='bg-white dark:bg-gray-800 text-black dark:text-white'>
  Адаптивный к теме контент
</div>
```

## Кастомные стили

### CSS переменные

В `globals.css` определены CSS переменные для цветов:

```css
:root {
  --background: linear-gradient(150deg, #0026eb80 2%, #ffffff 54%);
  --foreground: #171717;
}
```

### Расширение темы

В `tailwind.config.js` добавлены кастомные цвета и шрифты:

```javascript
theme: {
  extend: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
    },
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
      mono: ['var(--font-geist-mono)', 'monospace'],
    },
  },
}
```

## Совместимость с существующими стилями

Tailwind CSS работает параллельно с существующими стилями:

- CSS модули (`.module.css`)
- Styled Components
- Inline стили

## Рекомендации

1. **Приоритет использования**: Tailwind CSS для новых компонентов
2. **Градиентная миграция**: Постепенно заменяйте существующие стили
3. **Компонентный подход**: Создавайте переиспользуемые компоненты с Tailwind классами
4. **Консистентность**: Используйте стандартные классы Tailwind для единообразия

## Полезные ссылки

- [Документация Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
