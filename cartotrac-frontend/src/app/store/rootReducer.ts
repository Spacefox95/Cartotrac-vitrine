import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import clientsReducer from './slices/clientsSlice';
import quotesReducer from './slices/quotesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  clients: clientsReducer,
  quotes: quotesReducer,
});

export default rootReducer;
