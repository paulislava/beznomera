import { useEffect, useRef } from 'react';

/**
 * В react 18 в dev режиме с включенным StrictMode useEffect с пустыми зависимостями отрабатывает 2 раза
 * Если нужно чтобы useEffect отработал только один раз - можно использовать этот хук
 * Но аккуратно - если эффект подразумевает функцию отчистки, здесь она НЕ будет выполнена и лучше
 * использовать обычный useEffect
 *
 * @param {Function} effect - эффект callback
 */
export const useEffectOnce = (effect: () => void) => {
    const isEffectCalled = useRef(false);

    useEffect(() => {
        if (!isEffectCalled.current) {
            isEffectCalled.current = true;
            effect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
