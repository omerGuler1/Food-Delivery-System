import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

interface CustomerAnalyticsData {
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}

interface CustomerAnalyticsProps {
  data: CustomerAnalyticsData[];
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof CustomerAnalyticsData;
  label: string;
  numeric: boolean;
  format?: (value: any) => string;
}

const headCells: readonly HeadCell[] = [
  { id: 'customerId', label: 'ID', numeric: true },
  { id: 'customerName', label: 'Customer Name', numeric: false },
  { id: 'customerEmail', label: 'Email', numeric: false },
  { id: 'totalOrders', label: 'Total Orders', numeric: true },
  { 
    id: 'totalSpent', 
    label: 'Total Spent', 
    numeric: true,
    format: (value: number) => `$${value.toFixed(2)}`
  },
  { 
    id: 'averageOrderValue', 
    label: 'Avg. Order Value', 
    numeric: true,
    format: (value: number) => `$${value.toFixed(2)}`
  },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ data }) => {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof CustomerAnalyticsData>('totalSpent');

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof CustomerAnalyticsData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof CustomerAnalyticsData) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  // Calculate summary metrics
  const totalCustomers = data.length;
  const totalOrders = data.reduce((sum, customer) => sum + customer.totalOrders, 0);
  const totalSpent = data.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const avgOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;
  const avgSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Total Customers
          </Typography>
          <Typography variant="h4">
            {totalCustomers}
          </Typography>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Total Orders
          </Typography>
          <Typography variant="h4">
            {totalOrders}
          </Typography>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Total Revenue
          </Typography>
          <Typography variant="h4">
            ${totalSpent.toFixed(2)}
          </Typography>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Avg. Orders per Customer
          </Typography>
          <Typography variant="h4">
            {avgOrdersPerCustomer.toFixed(1)}
          </Typography>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Avg. Spent per Customer
          </Typography>
          <Typography variant="h4">
            ${avgSpentPerCustomer.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h5" gutterBottom>
        Customer Spending
      </Typography>
      
      <TableContainer component={Paper}>
        <Table aria-label="customer analytics table">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice().sort(getComparator(order, orderBy))
              .map((row) => (
                <TableRow
                  key={row.customerId}
                  hover
                >
                  <TableCell align="right">{row.customerId}</TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{row.customerEmail}</TableCell>
                  <TableCell align="right">{row.totalOrders}</TableCell>
                  <TableCell align="right">${row.totalSpent.toFixed(2)}</TableCell>
                  <TableCell align="right">${row.averageOrderValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No customer data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomerAnalytics; 