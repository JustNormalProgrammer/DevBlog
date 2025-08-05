import { createFileRoute, redirect } from '@tanstack/react-router'
import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'
import type { Editor as TinyMCEEditor } from 'tinymce'
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
  const privateApi = useAxiosPrivate()
  const editorRef = useRef<TinyMCEEditor>(null)
  const log = async () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent())
      try {
        await privateApi.post('/posts', {
          title: 'My first blogpost',
          content: editorRef.current.getContent(),
          isPublic: true,
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
  return (
    <>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(evt, editor) => (editorRef.current = editor)}
        init={{
          placeholder: 'Type here...',
          height: 500,
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
        }}
      />
      <button onClick={log}>Log editor content</button>
    </>
  )
}
