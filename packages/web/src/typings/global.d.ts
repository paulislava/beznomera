type ChildrenProps = {
  children?: React.ReactNode;
};

type Maybe<T> = T | undefined | null;

type OneOrMany<T> = T | T[];
type OneAndMany<T> = T & T[];

type Paths<T> = T extends object
  ? T extends (infer E)[]
    ? Paths<E>
    : {
        [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${Paths<T[K]>}`}`;
      }[keyof T]
  : never;

type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

type SActiveProps = {
  $active: boolean;
};

type SOpenProps = {
  $isOpen: boolean;
};

type OpenProps = {
  isOpen: boolean;
};

type ValidatePath<T, K extends string> = K extends keyof T
  ? K
  : K extends `${infer K0}.${infer KR}`
    ? K0 extends keyof T
      ? `${K0}.${ValidatePath<T[K0], KR>}`
      : Extract<keyof T, string>
    : Extract<keyof T, string>;

// Доработать для вложенных свойств
type DeepIdx<T, K extends Paths<T>> = K extends keyof T
  ? T[K]
  : K extends `${infer K0 extends string}.${infer KR extends string}`
    ? K0 extends keyof T
      ? DeepIdx<NonNullable<T[K0]>, KR>
      : never
    : never;

type OneOrMany<T> = T | T[];

type Promisable<T> = T | Promise<T>;

type ProxyFunction<T, Return = any> = T extends (...args: any[]) => any
  ? (...params: Parameters<T>) => Return
  : never;

type ClassNameProps = {
  className?: string;
};

type AwaitedResult<T> = Awaited<ReturnType<T>>;
type ArrElement<ArrType> =
  NonNullable<ArrType> extends readonly (infer ElementType)[] ? ElementType : never;

type ExtractPromised<T> = Awaited<ReturnType<T>>;
type ExtractPromisedElement<T> = ArrElement<ExtractPromised<T>>;

type MapRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

type MakeOptional<T> = {
  [P in keyof T]?: T[P];
};

type MakeOptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type ColorSchemeName = 'light' | 'dark' | null | undefined;

type PromiseParams<T> = { params: Promise<T>; request: NextRequest };
