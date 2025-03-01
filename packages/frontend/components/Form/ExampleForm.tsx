import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Form, Field, FieldRenderProps as RFFFieldRenderProps } from 'react-final-form';

interface FormValues {
  email: string;
  password: string;
}

type FieldRenderProps = RFFFieldRenderProps<string, any>;

const ExampleForm = () => {
  const onSubmit = (values: FormValues) => {
    console.log('Form values:', values);
  };

  const required = (value: string) => (value ? undefined : 'Обязательное поле');
  const email = (value: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? undefined : 'Некорректный email';

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, pristine }) => (
        <View style={styles.container}>
          <Field name='email' validate={value => required(value) || email(value)}>
            {({ input, meta }: FieldRenderProps) => (
              <View style={styles.fieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Email'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  onChangeText={input.onChange}
                  onBlur={input.onBlur}
                  value={input.value}
                />
                {meta.error && meta.touched && <Text style={styles.error}>{meta.error}</Text>}
              </View>
            )}
          </Field>

          <Field name='password' validate={required}>
            {({ input, meta }: FieldRenderProps) => (
              <View style={styles.fieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Пароль'
                  secureTextEntry
                  onChangeText={input.onChange}
                  onBlur={() => input.onBlur()}
                  value={input.value}
                />
                {meta.error && meta.touched && <Text style={styles.error}>{meta.error}</Text>}
              </View>
            )}
          </Field>

          <TouchableOpacity
            style={[styles.button, (submitting || pristine) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || pristine}
          >
            <Text style={styles.buttonText}>{submitting ? 'Отправка...' : 'Отправить'}</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  fieldContainer: {
    marginBottom: 16
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ExampleForm;
