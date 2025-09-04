import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Hook tipado para `dispatch` de Redux Toolkit.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Hook tipado para `useSelector` con el `RootState` del store.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

