import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { store } from 'app/store';

const StoreProvider = ({ children }: PropsWithChildren) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;