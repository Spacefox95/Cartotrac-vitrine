export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type AsyncResourceState = {
  status: AsyncStatus;
  errorMessage: string | null;
};

export const initialAsyncResourceState: AsyncResourceState = {
  status: 'idle',
  errorMessage: null,
};

export function markPending(state: AsyncResourceState) {
  state.status = 'loading';
  state.errorMessage = null;
}

export function markSucceeded(state: AsyncResourceState) {
  state.status = 'succeeded';
  state.errorMessage = null;
}

export function markFailed(state: AsyncResourceState, message: string) {
  state.status = 'failed';
  state.errorMessage = message;
}
