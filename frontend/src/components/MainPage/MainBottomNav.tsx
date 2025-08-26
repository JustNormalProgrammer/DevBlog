import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { AnimatePresence, motion } from 'motion/react'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Input from '@mui/material/Input'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function BottomNav({
  page,
  q,
  isShowingHiddenPosts,
  pages = 10,
}: {
  page: number
  q: string
  isShowingHiddenPosts: boolean
  pages: any
}) {
  const navigate = useNavigate()
  const [paginationNavState, setPaginationNavState] = useState({
    hover: false,
    focus: false,
  })
  const paginationInput = useRef<HTMLInputElement>(null)
  const paginationWrapper = useRef<HTMLInputElement>(null)
  // at the time of writing this, i had no idea you could pass pseudo elements to 'sx' prop. Now im to lazy to change this
  const isPaginationNavActive = Object.values(paginationNavState).some(
    (value) => value,
  )
  const [pageValue, setPageValue] = useState(page)
  useEffect(() => {
    setPageValue(page)
  }, [page])
  useEffect(() => {
    const focusInput = () => {
      paginationInput.current?.focus()
      paginationInput.current?.select()
    }
    paginationWrapper.current?.addEventListener('click', focusInput)
    return () =>
      paginationWrapper.current?.removeEventListener('click', focusInput)
  }, [])

  function handleNextPage() {
    const nextPage = page + 1
    navigate({
      to: isShowingHiddenPosts ? '/hidden' : '/',
      search: { q, page: nextPage },
    })
  }
  function handlePreviousPage() {
    const previousPage = page - 1
    navigate({
      to: isShowingHiddenPosts ? '/hidden' : '/',
      search: { q, page: previousPage },
    })
  }
  const debouncedNavigate = useDebouncedCallback((value: number) => {
    navigate({
      to: isShowingHiddenPosts ? '/hidden' : '/',
      search: { q, page: value },
    })
  }, 400)
  function handlePaginationChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { value } = e.currentTarget
    const valueNum = Number(value)
    if (!Number.isFinite(valueNum) || valueNum < 1) {
      return null
    }
    setPageValue(valueNum)
    debouncedNavigate(valueNum)
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: '10px',
        right: '50%',
        transform: 'translateX(50%)',
        height: '50px',
        borderRadius: '20px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: '9999',
      }}
      elevation={10}
    >
      <IconButton
        aria-label="previous page"
        color="primary"
        disabled={page === 1}
        onClick={handlePreviousPage}
      >
        <ArrowBackIcon />
      </IconButton>
      <Box
        onMouseEnter={() =>
          setPaginationNavState((prev) => ({ ...prev, hover: true }))
        }
        onMouseLeave={() =>
          setPaginationNavState((prev) => ({ ...prev, hover: false }))
        }
        ref={paginationWrapper}
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            height: '40px',
            width: '40px',
            border: `2px solid`,
            borderColor: paginationNavState.focus ? 'primary.main' : 'grey.400',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Input
            inputRef={paginationInput}
            inputMode="numeric"
            onFocus={() =>
              setPaginationNavState((prev) => ({ ...prev, focus: true }))
            }
            onBlur={() =>
              setPaginationNavState((prev) => ({ ...prev, focus: false }))
            }
            value={pageValue}
            onChange={(e) => handlePaginationChange(e)}
            disableUnderline
            slotProps={{
              input: {
                style: {
                  textAlign: 'center',
                },
              },
            }}
          />
        </Box>
        <AnimatePresence>
          {isPaginationNavActive && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.1 }}
            >
              <Typography variant="subtitle1" color="textDisabled" noWrap>
                of {pages.pages}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      <IconButton
        aria-label="next page"
        color="primary"
        onClick={handleNextPage}
        disabled={page === pages.pages}
      >
        <ArrowForwardIcon />
      </IconButton>
    </Paper>
  )
}
