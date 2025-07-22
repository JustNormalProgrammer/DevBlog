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
import type { SubmitHandler } from 'react-hook-form'

type Inputs = {
  username: string
  password: string
  adminVerificationPwd: string
}

export default function Signup() {
  const [asAdmin, setAsAdmin] = useState(false)
  const inputAdminRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  useEffect(() => {
    if (asAdmin && inputAdminRef.current) {
      inputAdminRef.current.focus()
    }
  }, [asAdmin])

  const handleClick = () => {
    setAsAdmin((prev) => !prev)
  }

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data); // https://stackoverflow.com/questions/64469861/react-hook-form-handling-server-side-errors-in-handlesubmit
  console.log('errors: ', errors);
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
          transition: '0.5s',
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
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-start',
            }}
          >
            <Typography variant="subtitle2" color="textDisabled">
              Do you want to register as a publisher?{' '}
            </Typography>
            <Checkbox checked={asAdmin} onChange={handleClick}></Checkbox>
          </Stack>
          <AnimatePresence>
            {asAdmin && (
              <motion.div
                key="admin-password"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TextField
                  label="Admin Password"
                  variant="outlined"
                  helperText={errors.adminVerificationPwd?.message ?? "Enter admin verification password to register as a publisher"}
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
          <Button variant="contained" type='submit'>Signup</Button>
        </Box>
      </Paper>
    </Grid>
  )
}
