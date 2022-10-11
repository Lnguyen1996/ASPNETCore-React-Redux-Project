import { Button, ButtonGroup, Typography } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { decrement, increment } from './counterSlice';

export const ContactPage = () => {
  const { data, title } = useAppSelector(state=>state.counter);
  const dispatch = useAppDispatch();
  return (
    <>
      <Typography variant='h2'>
        {title}
      </Typography>
      <Typography variant='h2'>
        The data is : {data}
      </Typography>
      <ButtonGroup>
        <Button onClick={()=>dispatch(decrement(1))} variant='contained' color='error'>Decrement</Button>
        <Button onClick={()=>dispatch(increment(1))} variant='contained' color='primary'>Increment</Button>
        <Button onClick={()=>dispatch(increment(5))} variant='contained' color='secondary'>Increment By 5</Button>
      </ButtonGroup>
    </>
  )
}
