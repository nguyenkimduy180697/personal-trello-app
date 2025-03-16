import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

//Cấu hình cho material-ui-confirm
import { ConfirmProvider } from 'material-ui-confirm'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ThemeProvider theme={theme}>
    <ConfirmProvider defaultOptions={{
      allowClose: false,
      dialogProps : { maxWidth: 'xs' },
      cancellationButtonProps: {
        color: 'inherit'
      },
      confirmationButtonProps: {
        variant: 'outlined',
        color: 'secondary'
      },
      buttonOrder: ['confirm', 'cancel']
    }}>
      <CssBaseline />
      <App />
      <ToastContainer position="bottom-left" theme='colored' autoClose={5000}/>
    </ConfirmProvider>;
  </ThemeProvider>
  // </React.StrictMode>
)
