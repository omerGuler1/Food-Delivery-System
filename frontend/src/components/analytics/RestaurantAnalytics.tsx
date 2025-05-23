import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

interface RestaurantAnalyticsData {
  restaurantId: number;
  restaurantName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface RestaurantAnalyticsProps {
  data: RestaurantAnalyticsData[];
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof RestaurantAnalyticsData;
  label: string;
  numeric: boolean;
  format?: (value: any) => string;
}

const headCells: readonly HeadCell[] = [
  { id: 'restaurantId', label: 'ID', numeric: true },
  { id: 'restaurantName', label: 'Restaurant Name', numeric: false },
  { id: 'totalOrders', label: 'Total Orders', numeric: true },
  { 
    id: 'totalRevenue', 
    label: 'Total Revenue', 
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

const RestaurantAnalytics: React.FC<RestaurantAnalyticsProps> = ({ data }) => {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof RestaurantAnalyticsData>('totalRevenue');

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof RestaurantAnalyticsData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof RestaurantAnalyticsData) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  // Calculate summary metrics
  const totalRevenue = data.reduce((sum, restaurant) => sum + restaurant.totalRevenue, 0);
  const totalOrders = data.reduce((sum, restaurant) => sum + restaurant.totalOrders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Total Restaurants
          </Typography>
          <Typography variant="h4">
            {data.length}
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
            ${totalRevenue.toFixed(2)}
          </Typography>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="h6" gutterBottom>
            Avg. Order Value
          </Typography>
          <Typography variant="h4">
            ${avgOrderValue.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h5" gutterBottom>
        Restaurant Performance
      </Typography>
      
      <TableContainer component={Paper}>
        <Table aria-label="restaurant analytics table">
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
                  key={row.restaurantId}
                  hover
                >
                  <TableCell align="right">{row.restaurantId}</TableCell>
                  <TableCell>{row.restaurantName}</TableCell>
                  <TableCell align="right">{row.totalOrders}</TableCell>
                  <TableCell align="right">${row.totalRevenue.toFixed(2)}</TableCell>
                  <TableCell align="right">${row.averageOrderValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No restaurant data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RestaurantAnalytics; 