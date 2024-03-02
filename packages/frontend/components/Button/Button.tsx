import React, { FC } from 'react';
import { Text, Pressable } from 'react-native';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?(): void;
}

const Button: FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <Pressable onPress={onClick}>
      <Text>{children}</Text>
    </Pressable>
  );
};

export default Button;
