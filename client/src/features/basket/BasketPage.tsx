import { Button, Grid, Typography } from '@mui/material';
import { useAppSelector } from '../../app/store/configureStore';
import BasketSummary from './BasketSummary';
import BasketTable from './BasketTable';

function BasketPage() {
  const {basket } = useAppSelector(state => state.basket);



  if (!basket) return <Typography variant='h3'>Your basket is empty</Typography>
  return (
    <>
    
      <BasketTable items={basket.items}/>
      <Grid container >
        <Grid item xs={6}></Grid>
        <Grid item xs={6}>
          <BasketSummary />
          <Button href='/checkout' variant='contained' size='large' fullWidth sx={{ marginBottom: 20 }}>
            Checkout
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default BasketPage;