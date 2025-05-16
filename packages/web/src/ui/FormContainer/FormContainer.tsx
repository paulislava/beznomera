import { FileInfo } from '@shared/file/file.types';
import { FormApi } from 'final-form';
import {
  createContext,
  FC,
  FormEventHandler,
  HTMLAttributes,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { FormRenderProps, Form as RawForm, FormProps as RawProps, useForm } from 'react-final-form';
import styled from 'styled-components';
import { checkErrorAndScroll } from '@/utils/forms';

type ContainerRawProps = {
  wrap?: boolean;
};

type FormContainerProps = HTMLAttributes<HTMLFormElement> & ContainerRawProps;

export type FormContainerMainProps = ContainerRawProps & ClassNameProps;

export const StyledForm = styled.div`
  max-width: 660px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 16px;
`;

type FormContextProps = {
  loadingFiles: Promise<FileInfo>[];
  submit(): Promise<void>;
};

export const FormContext = createContext<FormContextProps>({
  loadingFiles: [],
  submit() {
    throw new Error('Submit is not initialized!');
  }
});

const FormContainer: FC<FormContainerProps> = ({ children, wrap = true, ...props }) => {
  return <form {...props}>{wrap ? <StyledForm>{children}</StyledForm> : children}</form>;
};

type FormProps<FormValues> = FormContainerMainProps & RawProps<FormValues>;

function FormRender<FormValues extends Record<string, any>>({
  wrap,
  className,
  loadingFiles,
  children,
  handleSubmit,
  errors,
  ...props
}: FormRenderProps<FormValues> & {
  loadingFiles: React.MutableRefObject<Promise<FileInfo>[]>;
} & FormContainerMainProps) {
  const { submit } = useForm();
  const providerProps = useMemo<FormContextProps>(
    () => ({
      loadingFiles: loadingFiles.current,
      async submit() {
        await submit();
        checkErrorAndScroll(errors);
      }
    }),
    [errors, loadingFiles, submit]
  );

  const containerProps = { wrap, className, children };

  const onSubmit: FormEventHandler = useCallback(
    event => {
      handleSubmit(event);

      checkErrorAndScroll(errors);
    },
    [handleSubmit, errors]
  );

  const content = useMemo(
    () =>
      typeof children === 'function' ? children({ ...props, errors, handleSubmit }) : children,
    [children, handleSubmit, props, errors]
  );

  return (
    <FormContext.Provider value={providerProps}>
      <FormContainer {...containerProps} onSubmit={onSubmit}>
        {content}
      </FormContainer>
    </FormContext.Provider>
  );
}

export function Form<FormValues extends Record<string, any>>({
  wrap,
  className,
  children,
  render: renderProp,
  onSubmit,
  ...formProps
}: FormProps<FormValues>) {
  const loadingFiles = useRef<Promise<FileInfo>[]>([]);

  const handleSubmit = useCallback(
    async (data: FormValues, form: FormApi<FormValues>) => {
      await Promise.all(loadingFiles.current);

      return onSubmit(data, form);
    },
    [onSubmit]
  );

  const render = useCallback(
    (props: FormRenderProps<FormValues>) => (
      <FormRender loadingFiles={loadingFiles} wrap={wrap} className={className} {...props}>
        {renderProp ? renderProp(props) : children}
      </FormRender>
    ),
    [children, className, renderProp, wrap]
  );

  return <RawForm {...formProps} onSubmit={handleSubmit} render={render} />;
}

export default FormContainer;
