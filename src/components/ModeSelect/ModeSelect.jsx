import { FormControl, Select, MenuItem, Box, InputLabel } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import { useColorScheme } from '@mui/material/styles'

const ModeSelect = () => {
  const { mode, setMode } = useColorScheme()
  if (!mode) {
    return null
  }

  const handleModeChange = (event) => {
    const selectedMode = event.target.value
    setMode(selectedMode)
  }

  return (
    <FormControl size='small' sx={{ minWidth: '120px' }}>
      <InputLabel
        id="mode-select-label-dark-light-mode"
        sx={{
          color: 'white',
          '&.Mui-focused': { color: 'white' }
        }}
      >Mode
      </InputLabel>
      <Select
        labelId="mode-select-label-dark-light-mode"
        id="mode-select"
        value={mode}
        onChange={handleModeChange}
        label="Select Mode"
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '&hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '.MuiSvgIcon-root': { color: 'white' }
        }}
      >
        <MenuItem value="light">
          <Box display="flex" alignItems="center" gap="8px">
            <LightModeIcon /> Light
          </Box>
        </MenuItem>
        <MenuItem value="dark">
          <Box display="flex" alignItems="center" gap="8px">
            <DarkModeOutlinedIcon /> Dark
          </Box>
        </MenuItem>
        <MenuItem value="system">
          <Box display="flex" alignItems="center" gap="8px">
            <SettingsBrightnessIcon /> System
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  )
}

export default ModeSelect
