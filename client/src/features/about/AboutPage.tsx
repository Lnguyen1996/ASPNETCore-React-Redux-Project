import { Alert, AlertTitle, Container, List, ListItem, ListItemText, Typography } from '@mui/material'

export const AboutPage = () => {

  return (
    <Container>
      <Typography gutterBottom variant='h2'>Lam Nguyen's e-commerce project</Typography>

      <Alert severity='info'>
        <AlertTitle>CSE 696 Lam's Project description</AlertTitle>
        <List>
          <ListItem >
            <ListItemText>This is an ecommerce project used for CSE 696 which is fullstack web application. Front end is React-js and Typescript, back end is implemented with dotnet 6.0 and Postgres for database. This application is also extended with payment proccess (Stripe)</ListItemText>
          </ListItem>
          <ListItem >

            <ListItemText>To test this you can register with fake user data or login with user name:bop and password:Pa$$w0rd</ListItemText>
          </ListItem>
        </List>
      </Alert>
    </Container>
  )
}
