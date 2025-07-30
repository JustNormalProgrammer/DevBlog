import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Grid, Paper } from '@mui/material'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { useNavigate } from '@tanstack/react-router'
import type { SubmitHandler } from 'react-hook-form'
import type { ExpressValidatorError, LoginInputs } from '@/types'
import api from '@/utils/axios'
import { CustomLink } from '@/components/primitives/CustomLink'
import { useAuth } from '@/contexts/authProvider'

export default function LoginPage() {
  const {login} = useAuth();
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>()
  const navigate = useNavigate()
  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      await login(data);
      navigate({ to: '/' })
    } catch (err) {
      if (!axios.isAxiosError(err)) {
        setFormError('Unexpected error occured')
        return
      }
      const { response } = err
      if (response?.status === 401) {
        setFormError('Username or password is invalid')
        return
      }
      const resErrors = response?.data?.error
      if (Array.isArray(resErrors) && resErrors.length > 0) {
        resErrors.forEach((error: ExpressValidatorError) => {
          setError(error.path as 'username' | 'password', {
            type: 'server',
            message: error.msg,
          })
        })
      } else {
        setFormError('Unexpected error occured')
      }
    }
  }
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
        <Divider sx={{ marginBottom: 4 }} />
        <Box
          component="form"
          onChange={() => setFormError('')}
          noValidate
          autoComplete="off"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '1.5rem',
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
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            required
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
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          {formError && (
            <Typography color="error" textAlign={'center'} margin={1}>
              {formError}
            </Typography>
          )}
          <Button variant="contained" type="submit">
            {isSubmitting ? (
              <CircularProgress size={25} color="inherit" />
            ) : (
              'Login'
            )}
          </Button>
          <Typography
            variant="subtitle2"
            color="textDisabled"
            textAlign={'center'}
          >
            Don't have an account?{' '}
            <CustomLink to={'/signup'} underline="none">
              Signup
            </CustomLink>
          </Typography>
        </Box>
      </Paper>
    </Grid>
  )
}
