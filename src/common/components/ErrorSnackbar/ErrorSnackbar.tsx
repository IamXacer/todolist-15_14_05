import * as React from 'react';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useDispatch, useSelector } from "react-redux"
import { selectAppError, setAppErrorAC } from "@/app/app-slice.ts"


 export const ErrorSnackbar=()=> {
   const dispatch = useDispatch();
   const error = useSelector(selectAppError);


  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return
    }
   dispatch(setAppErrorAC({error:null}))
  }

  return (
    <div>

      <Snackbar open={error !== null} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: '100%' }}>
          {error ? error : "An unknown error occurred"}
        </Alert>
      </Snackbar>
    </div>
  );
}
