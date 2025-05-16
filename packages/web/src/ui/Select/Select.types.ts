import { FieldRenderProps } from 'react-final-form';
import { ValidatorsProps } from '../FormField/FormField.types';
import { PopupChildrenRenderProps } from 'components/Popup';

export type OptionProps<Value = string, Data = any> = {
  label?: string;
  value: Value;
  data?: Data;
};

export type CompareProps<OptionValue> = {
  comparer?: (a: OptionValue, b: OptionValue) => boolean;
};

export type OptionsGenerator<
  Func extends () => Promise<any> = () => Promise<any>,
  OptionValue = string | number,
  Data = ExtractPromisedElement<Func>
> = ProxyFunction<Func, Promise<OptionProps<OptionValue, Data>[]>>;

export type AddPopupContentFunc<OptionValue = string> = (
  props: PopupChildrenRenderProps,
  addOrSetOption: (option: OptionProps<OptionValue>) => void
) => React.ReactNode;

export type SelectLoaderFunc<OptionValue> = () => Promise<OptionProps<OptionValue>[]>;

export type SelectRawProps<OptionValue = string> = {
  options?: OptionProps<OptionValue>[];
  freeMode?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  search?: boolean;
  keepSearch?: boolean;
  onSearch?(value?: string): Promise<OptionProps<OptionValue>[]>;
  addButtonContent?: React.ReactNode;
  addPopupContent?: AddPopupContentFunc<OptionValue>;
  loader?: SelectLoaderFunc<OptionValue>;
  getLabel?(value: OptionValue): string;
  defaultOption?: OptionProps<OptionValue>;
} & CompareProps<OptionValue>;

type SelectActionProps<OptionValue> = Partial<FieldRenderProps<OptionValue, HTMLElement>>;

export type SelectProps<OptionValue> = SelectRawProps<OptionValue> &
  (
    | (SelectActionProps<OptionValue> & {
        multiple?: false;
        onChange?(
          value: Maybe<OptionValue>,
          option?: OptionProps<OptionValue>
        ): void | Promise<void>;
        value?: OptionValue;
      })
    | (SelectActionProps<OptionValue[]> & {
        onChange?(
          value: Maybe<OptionValue[]>,
          option?: OptionProps<OptionValue>[]
        ): void | Promise<void>;
        value?: OptionValue[];
        multiple: true;
      })
  );

export type SelectFormFieldProps<FormData, OptionValue = unknown> = SelectRawProps<OptionValue> &
  ValidatorsProps & {
    name: Paths<FormData>;
  } & (
    | {
        multiple: true;
        onChange?(value: OptionValue[], option: OptionProps<OptionValue>[]): void;
      }
    | {
        multiple?: false;
        onChange?(value: OptionValue, option: OptionProps<OptionValue>): void;
      }
  );
