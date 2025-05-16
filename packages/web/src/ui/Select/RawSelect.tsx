import { useSetFalse } from '@/hooks/booleans';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import useUpdateEffect from '@/hooks/useUpdateEffect';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FieldMetaState } from 'react-final-form';
import { DropdownMultiple, Dropdown } from './components/Dropdown';
import * as S from './Select.styled';
import { SelectProps, OptionProps } from './Select.types';
import { CONTAINER_BLOCK_ID } from '@/helpers/constants';

export function RawSelect<OptionValue>({
  input,
  meta,
  onChange,
  value: fieldValue,
  options: rawOptions,
  placeholder,
  label,
  multiple,
  onSearch,
  keepSearch,
  loader,
  getLabel,
  search = true,
  defaultOption,
  required,
  freeMode,
  ...compareProps
}: SelectProps<OptionValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>();

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current || !dropdownRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const containerElement = document.getElementById(CONTAINER_BLOCK_ID);

    if (!containerElement) {
      setDropdownPosition('bottom');
      return;
    }

    const containerBottom = containerElement.getBoundingClientRect().bottom;
    const spaceBelow = containerBottom - containerRect.bottom;

    if (spaceBelow < dropdownRect.height && containerRect.top > dropdownRect.height) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
    }

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  const [options, setOptions] = useState(rawOptions);
  const [shouldScroll, setShouldScroll] = useState(false);

  const [loading, setLoading] = useState(!!onSearch || !!loader);

  useEffect(() => {
    if (shouldScroll) {
      setTimeout(() => {
        if (dropdownRef.current) {
          dropdownRef.current.scrollTop = dropdownRef.current.scrollHeight;
        }
        setShouldScroll(false);
      });
    }
  }, [shouldScroll]);

  const close = useSetFalse(setIsOpen);

  const shouldClose = useRef(false);

  const value = useMemo(() => input?.value ?? fieldValue, [input, fieldValue]);

  const [filteredOptions, setFilteredOptions] = useState<OptionProps<OptionValue>[]>(options || []);

  const valueWithOption: Maybe<OneOrMany<OptionProps<OptionValue>>> = useMemo(() => {
    if (!value) {
      return defaultOption;
    }

    if (getLabel) {
      return Array.isArray(value)
        ? value.map(val => ({ label: getLabel(val), value: val }))
        : { value, label: getLabel(value) };
    }

    const finalOptions = options && options.length > 0 ? options : filteredOptions;

    return Array.isArray(value)
      ? finalOptions.length > 0
        ? finalOptions.filter(opt => value.some(val => opt.value == val))
        : defaultOption
          ? [defaultOption]
          : undefined
      : finalOptions.find(opt => opt.value == value) || defaultOption;
  }, [defaultOption, filteredOptions, getLabel, options, value]);

  const handleChange = useCallback(
    (value: Maybe<OneOrMany<OptionValue>>, option?: OneOrMany<OptionProps<OptionValue>>) => {
      // TODO: Убрать костыль, когда Typescript пофиксят этот кейс
      onChange?.(value as OneAndMany<OptionValue>, option as OneAndMany<OptionProps<OptionValue>>);
      input?.onChange(value);
    },
    [input, onChange]
  );

  useUpdateEffect(() => {
    if (loading) {
      return;
    }

    if (Array.isArray(value) && Array.isArray(valueWithOption)) {
      if (value.length > valueWithOption.length) {
        handleChange(
          valueWithOption.map(o => o.value),
          valueWithOption
        );
      }
    } else if (value && !valueWithOption) {
      handleChange(null);
    }
  }, [valueWithOption]);

  useEffectOnce(() => {
    if (!value && defaultOption) {
      handleChange(defaultOption.value, defaultOption);
    }

    if (valueWithOption && !Array.isArray(valueWithOption) && valueWithOption.label && keepSearch) {
      setSearchValue(valueWithOption.label);
    }
  });

  const load = useCallback(async () => {
    if (onSearch) {
      setFilteredOptions(await onSearch(searchValue));
    } else if (loader) {
      setOptions(await loader());
    }

    setLoading(false);
  }, [loader, onSearch, searchValue]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setOptions(rawOptions);
  }, [rawOptions]);

  useEffect(() => {
    if (!onSearch) {
      setFilteredOptions(
        options?.filter(
          option =>
            option.label?.toLowerCase().includes(searchValue.toLowerCase()) ||
            String(option.value).toLowerCase().includes(searchValue.toLowerCase())
        ) || []
      );
    }
  }, [searchValue, options, onSearch]);

  //   const addOrSetOption = useCallback(
  //     (option: OptionProps<OptionValue>) => {
  //       const newValue = multiple
  //         ? [...((value || []) as OptionValue[]), option.value]
  //         : option.value;

  //       const newOptions = multiple
  //         ? [...((valueWithOption || []) as OptionProps<OptionValue>[]), option]
  //         : option;

  //       handleChange(newValue, newOptions);

  //       setOptions([...(options || []), option]);
  //       setShouldScroll(true);
  //       unfreeze();
  //     },
  //     [handleChange, multiple, options, unfreeze, value, valueWithOption]
  //   );

  const onFocus = useCallback(() => {
    if (shouldClose.current) {
      shouldClose.current = false;
    } else if (!loading) {
      setIsOpen(true);
    }
  }, [loading]);

  const onDropdownChange = useCallback(
    (newOptions: OneOrMany<OptionProps<OptionValue>>) => {
      if (!multiple && !keepSearch) {
        shouldClose.current = true;
        close();
        setSearchValue('');
      }
      if (
        keepSearch &&
        !Array.isArray(newOptions) &&
        (newOptions.label || String(newOptions.value))
      ) {
        setSearchValue(newOptions.label || String(newOptions.value));
      }

      const newValue = Array.isArray(newOptions)
        ? newOptions.map(val => val.value)
        : newOptions.value;

      const change = onChange?.(
        newValue as OneAndMany<OptionValue>,
        newOptions as OneAndMany<OptionProps<OptionValue>>
      );

      if (change && change instanceof Promise) {
        setLoading(true);
        change.then(() => {
          setLoading(false);
        });
      }

      input?.onChange?.(newValue);
    },
    [onChange, close, keepSearch, multiple, input]
  );

  const onClickOutside = useCallback(() => {
    if (freeMode && searchValue && !value) {
      const newValue = searchValue as unknown as OptionValue;
      handleChange(newValue, { value: newValue, label: searchValue });

      close();
      if (multiple && !keepSearch && (value as OptionValue[]).length > 0) {
        setSearchValue('');
      }
    }
  }, [close, multiple, keepSearch, value, freeMode, searchValue, handleChange]);

  useClickOutside(onClickOutside, [dropdownRef], isOpen);

  const [preparedPlaceholder, fillPlaceholder] = useMemo(() => {
    const getValue = () => {
      if (Array.isArray(valueWithOption)) {
        return valueWithOption.map(({ label, value }) => label || value).join(', ');
      } else {
        return valueWithOption ? (valueWithOption.label ?? String(valueWithOption.value)) : null;
      }
    };

    const valuePlaceholder = getValue();

    return [
      valuePlaceholder || placeholder || (search ? 'Поиск...' : 'Не выбрано'),
      !!valuePlaceholder
    ];
  }, [placeholder, valueWithOption, search]);

  const preparedLabel = useMemo(() => {
    if (!value) {
      return `${label}`;
    }

    return `${label}: ${preparedPlaceholder}`;
  }, [label, value, preparedPlaceholder]);

  return (
    <S.Container ref={containerRef}>
      <S.Input
        name={input?.name}
        onBlur={input?.onBlur}
        onFocus={onFocus}
        value={searchValue}
        placeholder={preparedPlaceholder}
        meta={(meta as FieldMetaState<string>) ?? {}}
        label={preparedLabel}
        $isOpen={isOpen}
        $fillPlaceholder={fillPlaceholder}
        readOnly={!search}
        required={required && (!value || (Array.isArray(value) && value.length === 0))}
        onChange={setSearchValue}
        rightContent={
          <S.Dropdown $isOpen={isOpen} $position={dropdownPosition} ref={dropdownRef}>
            {filteredOptions.length > 0 ? (
              multiple ? (
                <DropdownMultiple<OptionValue>
                  options={filteredOptions}
                  value={valueWithOption as OptionProps<OptionValue>[]}
                  onChange={onDropdownChange}
                  {...compareProps}
                />
              ) : (
                <Dropdown<OptionValue>
                  options={filteredOptions}
                  value={valueWithOption as OptionProps<OptionValue>}
                  onChange={onDropdownChange}
                  {...compareProps}
                />
              )
            ) : (
              <S.NoOptionsText>Нет данных</S.NoOptionsText>
            )}
          </S.Dropdown>
        }
      />
    </S.Container>
  );
}
