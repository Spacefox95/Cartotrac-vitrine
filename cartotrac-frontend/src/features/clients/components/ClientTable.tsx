import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { Client } from '../types/client.types';

type ClientTableProps = {
  clients: Client[];
  onView: (clientId: number) => void;
  onEdit: (clientId: number) => void;
  onDelete: (clientId: number) => void;
  isDeleting: boolean;
};

const fallback = 'Non renseigné';

const ClientTable = ({
  clients,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: ClientTableProps) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Entreprise</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} hover>
              <TableCell>
                <Typography fontWeight={600}>{client.company_name}</Typography>
              </TableCell>
              <TableCell>{client.contact_name ?? fallback}</TableCell>
              <TableCell>{client.email ?? fallback}</TableCell>
              <TableCell>{client.phone ?? fallback}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => onView(client.id)}>
                    Voir
                  </Button>
                  <Button size="small" onClick={() => onEdit(client.id)}>
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    disabled={isDeleting}
                    onClick={() => onDelete(client.id)}
                  >
                    Supprimer
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClientTable;
