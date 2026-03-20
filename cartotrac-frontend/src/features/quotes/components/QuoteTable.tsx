import {
  Button,
  Chip,
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

import type { Quote } from '../types/quote.types';

type QuoteTableProps = {
  quotes: Quote[];
  onView: (quoteId: number) => void;
  onEdit: (quoteId: number) => void;
  onDelete: (quoteId: number) => void;
  isDeleting: boolean;
};

const formatCurrency = (value: string) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value;
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const QuoteTable = ({ quotes, onView, onEdit, onDelete, isDeleting }: QuoteTableProps) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Reference</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Total HT</TableCell>
            <TableCell>Total TTC</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id} hover>
              <TableCell>
                <Typography fontWeight={600}>{quote.reference}</Typography>
              </TableCell>
              <TableCell>#{quote.client_id}</TableCell>
              <TableCell>
                <Chip label={quote.status} size="small" />
              </TableCell>
              <TableCell>{formatCurrency(quote.total_ht)}</TableCell>
              <TableCell>{formatCurrency(quote.total_ttc)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => onView(quote.id)}>
                    Voir
                  </Button>
                  <Button size="small" onClick={() => onEdit(quote.id)}>
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    disabled={isDeleting}
                    onClick={() => onDelete(quote.id)}
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

export default QuoteTable;
