import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import logo from "../assets/rooted-logo.png";

function SupportDialog({ open, onClose }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="support-dialog-title"
      slotProps={{
        paper: {
          className: "support-dialog-paper",
        },
        backdrop: {
          sx: {
            backgroundColor: "rgba(60, 53, 70, 0.68)",
          },
        },
      }}
    >
      <DialogTitle id="support-dialog-title" className="support-dialog-title">
        <span className="support-dialog-heading">
          Contact
          <img src={logo} alt="Rooted" className="support-dialog-logo" />
          Support
        </span>
        <small>Questions, concerns, or something not working? Let us know.</small>

        <IconButton
          aria-label="Close support form"
          onClick={handleClose}
          sx={{ position: "absolute", right: 12, top: 10 }}
        >
          ×
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          className="support-dialog-content"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {submitted ? (
            <p>Thanks for reaching out! Support delivery will be connected in a future update.</p>
          ) : (
            <>
              <TextField
                className="support-field"
                name="email"
                label="Email"
                type="email"
                required
                fullWidth
              />

              <TextField
                className="support-field"
                name="subject"
                label="Subject"
                required
                fullWidth
              />

              <TextField
                className="support-field"
                name="message"
                label="How can we help?"
                required
                multiline
                minRows={5}
                fullWidth
              />
            </>
          )}
        </DialogContent>

        <DialogActions className="support-dialog-actions">
          <Button type="button" className="support-cancel-button" onClick={handleClose}>
            {submitted ? "Close" : "Cancel"}
          </Button>

          {!submitted && (
            <Button type="submit" variant="contained" className="support-submit-button">
              Submit
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SupportDialog;
