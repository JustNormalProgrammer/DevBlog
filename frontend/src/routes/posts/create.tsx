import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Editor } from '@tinymce/tinymce-react'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  TextField,
  Typography,
  useColorScheme,
} from '@mui/material'
import Stack from '@mui/material/Stack'
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import type { Editor as TinyMCEEditor } from 'tinymce'
import type { CreatePostInputs } from '@/types'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

export const Route = createFileRoute('/posts/create')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname + location.search,
        },
      })
    }
    if (!context.auth.user?.isAdmin) {
      throw redirect({
        to: '/forbidden',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { mode } = useColorScheme()
  if (!mode) {
    return null
  }
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState('')
  const privateApi = useAxiosPrivate()
  const editorRef = useRef<TinyMCEEditor>(null)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInputs>({
    defaultValues: {
      isPublic: true,
    },
  })
  const onSubmit: SubmitHandler<CreatePostInputs> = async (data) => {
    if (editorRef.current) {
      try {
        const response = await privateApi.post('/posts', {
          ...data,
          content: editorRef.current.getContent(),
        })
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        navigate({ to: '/posts/$postId', params: { postId: response.data.id } })
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401)
            setFormError(
              'You are not logged in. Please log in to create a post',
            )
          if (Array.isArray(err.response?.data.error)) {
            if (err.response.data.error[0].path === 'title') {
              setError('title', {
                type: 'server',
                message: err.response.data.error[0].msg,
              })
              return
            } else {
              setFormError('Content cannot be empty')
              return
            }
          }
        }
        setFormError('Unexpected error occured')
      }
      console.log({ ...data, content: editorRef.current.getContent() })
    }
  }
  return (
    <Stack
      spacing={3}
      maxWidth={800}
      width={'100%'}
      component={'form'}
      onChange={() => setFormError('')}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        label="Title"
        fullWidth
        id="title"
        {...register('title', {
          required: 'Title is required',
          minLength: {
            value: 1,
            message: 'Title cannot be empty',
          },
          maxLength: {
            value: 256,
            message: 'Title cannot exceed 256 characters',
          },
        })}
        error={!!errors.title}
        helperText={errors.title?.message}
      />
      <Editor
        key={mode}
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(_, editor) => (editorRef.current = editor)}
        init={{
          placeholder: 'Type content of the post here...',
          height: 500,
          width: '100%',
          menubar: false,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'code',
            'help',
            'wordcount',
            'codesample',
          ],
          toolbar:
            'undo redo | blocks | codesample |' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          skin: mode === 'dark' ? 'oxide-dark' : 'oxide',
          content_css: mode === 'dark' ? 'dark' : 'default',
        }}
      />
      <Stack direction={'row'} spacing={1} alignItems={'center'}>
        <Typography variant="subtitle1" color="textDisabled">
          Make post public?
        </Typography>
        <Controller
          name="isPublic"
          control={control}
          render={({ field }) => <Checkbox {...field} defaultChecked={true} />}
        />
      </Stack>
      {formError && (
        <Typography textAlign={'center'} color="error">
          {formError}
        </Typography>
      )}
      <Button
        type="submit"
        variant="outlined"
        color="primary"
        loading={isSubmitting}
      >
        Create
      </Button>
    </Stack>
  )
}
