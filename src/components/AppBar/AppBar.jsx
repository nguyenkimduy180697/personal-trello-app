import { useState } from 'react'
import { Box, Button, TextField, Badge, Tooltip, InputAdornment } from '@mui/material'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import Profiles from './Menus/Profiles'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

function AppBar() {
  const [searchValue, setSearchValue] = useState('')
  return (
    <>
      <Box sx={{
        with: '100%',
        height: (theme) => theme.trello.appBarHeight,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2c3e50' : '#1565c0' )
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AppsIcon sx={{ color: 'white' }}></AppsIcon>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SvgIcon component={TrelloIcon} inheritViewBox fontSize='small' sx={{ color: 'white' }}/>
            <Typography variant="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Trello</Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Workspaces />
            <Recent />
            <Starred />
            <Templates />
            <Button
              sx={{
                color: 'white',
                border: 'none',
                '&:hover': {
                  border: 'none'
                }
              }}
              variant='outlined'
              startIcon={<LibraryAddIcon/>}
            >
              Create
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            id="outlined-search"
            label="Search...."
            type="text"
            size='small'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}

            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }}/>
                  </InputAdornment>
                ),
                endAdornment:  (
                  <InputAdornment position="start">
                    <CloseIcon
                      fontSize='small'
                      sx={{ color: searchValue ? 'white' : 'transparent', cursor: 'pointer' }}
                      onClick={() => setSearchValue('')}
                    />
                  </InputAdornment>
                )
              }
            }}
            sx={{
              minWidth: '120px',
              maxWidth: '180px',
              '& label': { color: 'white' },
              '& input': { color: 'white' },
              '& label.Mui-focused': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' }
              }
            }}
          />
          <ModeSelect />
          <Tooltip title="Notification">
            <Badge color="warning" variant="dot" sx={{ cursor: 'pointer' }}>
              <NotificationsNoneIcon sx={{ color: 'white' }}/>
            </Badge>
          </Tooltip>
          <Tooltip title="Help" sx={{ color: 'white', cursor: 'pointer' }}>
            <HelpOutlineIcon />
          </Tooltip>
          <Profiles />
        </Box>
      </Box>
    </>
  )
}

export default AppBar