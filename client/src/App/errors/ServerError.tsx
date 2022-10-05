import { Button, Divider, Paper, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function ServerError() {
    const history = useHistory();
    const {state} = useLocation<any>();

    return (
        <Container component={Paper}>
            {state?.error ? (
                <>
                    <Typography variant='h5' color='error' gutterBottom>{state.error.title}</Typography>
                    <Divider />
                    <Typography>{state.error.detail || 'Internal server error'}</Typography>
                </>) : (
                <Typography variant='h5' gutterBottom>Server error</Typography>

            )}
            <Button onClick={()=>history.push('/catalog')}>Go back</Button>
        </Container>
    );
}

export default ServerError;