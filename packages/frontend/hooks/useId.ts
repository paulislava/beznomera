import { ID_PARAM } from 'helpers/router-paths';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

export const useId = () => {
    const value = useParams()[ID_PARAM];

    if (!value) {
        throw new Error(`ID wasn't provided in URL`);
    }

    return value;
};

export const useNumberId = () => {
    const value = useId();

    return Number.parseInt(value);
};

export function useWithId<ReturnType>(callback: (id: string) => ReturnType) {
    const id = useId();

    return useCallback(() => callback(id), [callback, id]);
}

export function useWithNumberId<ReturnType>(
    callback: (id: number) => ReturnType
) {
    const id = useNumberId();

    return useCallback(() => callback(id), [callback, id]);
}
