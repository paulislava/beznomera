export type Creatable<T, Value = any> = {
  value: Maybe<T>;
  newValue: Value;
} | null;
