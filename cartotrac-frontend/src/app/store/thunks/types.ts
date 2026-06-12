import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import type { RootState } from 'app/store';

export type AppThunk<TResult = void> = ThunkAction<
  Promise<TResult>,
  RootState,
  unknown,
  AnyAction
>;
