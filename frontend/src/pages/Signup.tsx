import axios from 'axios'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Grid, Paper } from '@mui/material'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import { useEffect, useRef, useState } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'motion/react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CheckIcon from '@mui/icons-material/Check'
import CircularProgress from '@mui/material/CircularProgress'
import type { SubmitHandler } from 'react-hook-form'
import type { ExpressValidatorError, RegisterInputs } from '@/types'
import api from '@/utils/axios'
import { CustomLink } from '@/components/primitives/CustomLink'

export default function Signup() {
  const [asAdmin, setAsAdmin] = useState(false)
  const inputAdminRef = useRef<HTMLInputElement>(null)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false) // success -> user registered successfully
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInputs>()

  useEffect(() => {
    if (asAdmin && inputAdminRef.current) {
      inputAdminRef.current.focus()
    }
  }, [asAdmin])

  const handleClick = () => {
    setAsAdmin((prev) => !prev)
  }

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    if (!asAdmin) delete data.adminVerificationPwd
    try {
      await api.post('/auth/register', data, {
        withCredentials: true,
      })
      setSuccess(true)
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
  } // https://stackoverflow.com/questions/64469861/react-hook-form-handling-server-side-errors-in-handlesubmit
  return (
    <Grid
      container
      sx={{
        justifyContent: 'center',
        marginTop: '40px',
      }}
    >
      <Paper
        sx={{
          m: 5,
          p: 3,
          maxWidth: '500px',
          width: '100%',
        }}
        elevation={2}
      >
        <Typography
          variant="h2"
          align="center"
          color="primary"
          marginBottom={1}
        >
          Signup
        </Typography>
        <Divider sx={{ marginBottom: 4 }} />
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onChange={() => setFormError('')}
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
              maxLength: {
                value: 20,
                message: 'Password cannot exceed 30 characters',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Stack
            direction="row"
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-start',
              my: -2,
            }}
          >
            <Typography variant="subtitle2" color="textDisabled">
              Do you want to register as a publisher?
            </Typography>
            <Checkbox checked={asAdmin} onChange={handleClick} size="small" />
          </Stack>
          <AnimatePresence>
            {asAdmin && (
              <motion.div
                key="admin-password"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <TextField
                  label="Admin Password"
                  variant="outlined"
                  type="password"
                  helperText={
                    errors.adminVerificationPwd?.message ??
                    'Enter admin verification password to register as a publisher'
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyOutlinedIcon color="disabled" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                  inputRef={inputAdminRef}
                  {...register('adminVerificationPwd', {
                    required: 'To register as a publisher enter valid password',
                    minLength: {
                      value: 1,
                      message: 'Verification password cannot be empty',
                    },
                    maxLength: {
                      value: 256,
                      message:
                        'Verification password cannot exceed 256 characters',
                    },
                  })}
                  error={!!errors.adminVerificationPwd}
                />
              </motion.div>
            )}
          </AnimatePresence>
          {formError && (
            <Typography
              color="error"
              textAlign={'center'}
              sx={{ marginBottom: -1 }}
            >
              {formError}
            </Typography>
          )}
          <Button
            variant="contained"
            type="submit"
            sx={{ marginTop: '7px' }}
            loading={isSubmitting}
          >
            Signup
          </Button>
          <Typography
            variant="subtitle2"
            color="textDisabled"
            textAlign={'center'}
          >
            Already have an account?{' '}
            <CustomLink to={'/login'} underline="none">
              Login
            </CustomLink>
          </Typography>
        </Box>
      </Paper>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={success}
        onClose={() => {
          setSuccess(false)
        }}
        key={'success'}
      >
        <Alert
          severity="success"
          icon={<CheckIcon fontSize="inherit" />}
          variant="filled"
        >
          Account created{' '}
          <CustomLink to={'/login'} underline="none" sx={{ color: '#D0F0C0' }}>
            Login
          </CustomLink>
        </Alert>
      </Snackbar>
    </Grid>
  )
}
