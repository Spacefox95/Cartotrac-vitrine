import { clientsActions } from 'app/store/slices/clientsSlice';
import type { Client, ClientPayload, ClientsListResponse } from 'features/clients/types/client.types';
import { http } from 'shared/api/http';
import { apiRoutes } from 'shared/api/routes';

import type { AppThunk } from './types';

export const fetchClients = (search?: string): AppThunk<ClientsListResponse> => {
  return async (dispatch) => {
    dispatch(clientsActions.setLoading(true));

    try {
      const response = await http.get<ClientsListResponse>(apiRoutes.clients, {
        params: search ? { search } : undefined,
      });

      dispatch(clientsActions.setClients(response.data));
      return response.data;
    } catch (err) {
      dispatch(clientsActions.setError('Impossible de charger les clients.'));
      console.error(err);
      throw err;
    }
  };
};

export const fetchClient = (clientId: number): AppThunk<Client> => {
  return async () => {
    try {
      const response = await http.get<Client>(apiRoutes.clientById(clientId));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const createClient = (payload: ClientPayload): AppThunk<Client> => {
  return async () => {
    try {
      const response = await http.post<Client>(apiRoutes.clients, normalizeClientPayload(payload));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const updateClient = ({
  clientId,
  payload,
}: {
  clientId: number;
  payload: ClientPayload;
}): AppThunk<Client> => {
  return async () => {
    try {
      const response = await http.patch<Client>(
        apiRoutes.clientById(clientId),
        normalizeClientPayload(payload),
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const deleteClient = (clientId: number): AppThunk => {
  return async (dispatch) => {
    try {
      await http.delete(apiRoutes.clientById(clientId));
      dispatch(clientsActions.removeClient(clientId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

function normalizeClientPayload(payload: ClientPayload) {
  return {
    company_name: payload.company_name.trim(),
    contact_name: payload.contact_name?.trim() || null,
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
  };
}
