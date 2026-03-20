import { combineReducers } from '@reduxjs/toolkit';

import authReducer from 'features/auth/store/authSlice';
import clientsReducer from 'features/clients/store/clientsSlice';
import quotesReducer from 'features/quotes/store/quotesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  clients: clientsReducer,
  quotes: quotesReducer,
});

export default rootReducer;
