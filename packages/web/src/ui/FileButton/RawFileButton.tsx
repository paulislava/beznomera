import React, { useState, useCallback, useMemo } from 'react';
import * as S from './FileButton.styled';
import { FileInputButtonProps } from './FileButton.types';
import { FILE_ACCEPT_VALUES } from './constants';

export const RawFileButton: React.FC<FileInputButtonProps> = ({ onChange, value, fileType }) => {
  const [fileName, setFileName] = useState<string>(''); // Состояние для хранения имени файла

  // Обработчик выбора файла
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('Файл изменен: ', event.target.files); // Логируем содержимое event.target.files

      const file = event.target.files ? event.target.files[0] : null;
      if (file) {
        console.log('Файл выбран:', file.name); // Логируем выбранный файл
        setFileName(file.name); // Обновляем имя файла
        onChange(file); // Вызываем колбек для обработки выбранного файла
      } else {
        console.log('Файл не выбран');
        setFileName(''); // Если файл не выбран, сбрасываем имя файла
        onChange(null); // Отправляем null в колбек, если файл не выбран
      }
    },
    [onChange]
  );

  const accept = useMemo(() => fileType && FILE_ACCEPT_VALUES[fileType], [fileType]);

  // Открытие выбора файла при клике на кнопку

  return (
    <S.Container>
      <S.FilenameContainer>
        <S.Filename>{fileName ? fileName : value ? 'Файл загружен' : 'Выберите файл'}</S.Filename>
        {fileName ? '✅' : value ? '📌' : ''}
      </S.FilenameContainer>
      <input type='file' style={{ display: 'none' }} onChange={handleFileChange} accept={accept} />
    </S.Container>
  );
};

export default RawFileButton;
