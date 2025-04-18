import { cyan, deepOrange, orange, teal } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '50px'
const BOARD_BAR_HEIGHT = '56px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOTTER_HEIGHT = '56px'

let theme = createTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOTTER_HEIGHT
  },
  colorSchemes: {
    light: {
      // palette: {
      //   primary: teal,
      //   secondary: deepOrange
      // }
    },
    dark: {
      // palette: {
      //   primary: cyan,
      //   secondary: orange
      // }
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'white'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderWidth: '0.5px',
          '&:hover': {
            borderWidth: '0.5px'
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          // color: theme.palette.primary.main,
          fontSize: '0.875rem'
        })
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { fontSize: '0.875rem' }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => {
          return {
            // color: theme.palette.primary.main,
            // fontSize: '0.875rem',
            // '.MuiOutlinedInput-notchedOutline': {
            //   borderColor: theme.palette.primary.light
            // },
            // '&:hover': {
            //   '.MuiOutlinedInput-notchedOutline': {
            //     borderColor: theme.palette.primary.main
            //   }
            // },
            '& fieldset': {
              borderWidth: '0.5px !important'
            },
            '&:hover fieldset': {
              borderWidth: '1px !important'
            },
            '&.Mui-focused fieldset': {
              borderWidth: '1px !important'
            }
          }
        }
      }
    }
  }
})

export default theme