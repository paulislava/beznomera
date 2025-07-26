'use client';

import React from 'react';
import Button from '@/ui/Button/Button';
import { showSuccessMessage, showErrorMessage, showResponseMessage } from '@/utils/messages';
import { ResponseCode } from '@shared/errors';

export default function TestThemePage() {
  const handleTestSuccess = () => {
    showSuccessMessage('Успех!', 'Операция выполнена успешно');
  };

  const handleTestError = () => {
    showErrorMessage('Ошибка!', 'Произошла ошибка при выполнении операции');
  };

  const handleTestResponse = () => {
    showResponseMessage({
      code: ResponseCode.CALL_NEED_TIMEOUT,
      message: 'Тестовое сообщение'
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
      <div className='max-w-md w-full mx-4'>
        <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl border border-white/20'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-white mb-2'>Тест тостов</h1>
            <p className='text-white/80'>Проверка работы уведомлений</p>
          </div>

          <div className='space-y-4'>
            <Button onClick={handleTestSuccess} fullWidth>
              Показать успешное сообщение
            </Button>

            <Button onClick={handleTestError} fullWidth view='secondary'>
              Показать ошибку
            </Button>

            <Button onClick={handleTestResponse} fullWidth view='secondary'>
              Показать ответ сервера
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
