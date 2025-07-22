import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Grid, Paper } from '@mui/material'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'

type Inputs = {
  username: string
  password: string
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)
  console.log(errors)
  return (
    <Grid
      container
      sx={{
        justifyContent: 'center',
        marginTop: '40px',
      }}
    >
      <Paper
        sx={{ m: 5, p: 3, maxWidth: '500px', width: '100%' }}
        elevation={2}
      >
        <Typography
          variant="h2"
          align="center"
          color="primary"
          marginBottom={1}
        >
          Login
        </Typography>
        <Divider sx={{ marginBottom: 5 }} />
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '2rem',
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            label="Username"
            variant="outlined"
            required
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 1,
                message: 'Username cannot be empty',
              },
              maxLength: {
                value: 30,
                message: 'Username cannot exceed 30 characters',
              },
            })}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 1,
                message: 'Password cannot be empty',
              },
              maxLength: {
                value: 20,
                message: 'Password cannot exceed 30 characters',
              },
            })}
          />
          <Button variant="contained" type="submit">
            Login
          </Button>
        </Box>
      </Paper>
    </Grid>
  )
}
