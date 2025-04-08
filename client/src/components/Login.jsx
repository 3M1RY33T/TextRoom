import { useState } from "react";
import logo from "../assets/icon.webp";
import {
  Paper,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Alert,
} from "@mui/material";

const Login = (props) => {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");

  return (
    <Paper elevation={4} sx={{ mt: "0.5em" }}>
      <CardContent>
        <img
          src={logo}
          alt="App Logo"
          style={{
            width: "100px",
            height: "100px",
            marginBottom: "1em",
            display: "block",
            margin: "0 auto",
          }}
        />

        <CardHeader
          title="Join a Room"
          sx={{
            textAlign: "center",
            marginTop: "1em",
          }}
        />
        <TextField
          fullWidth
          label="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          sx={{ mb: "1em" }}
        />
        <TextField
          fullWidth
          label="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          sx={{ mb: "1em" }}
        />
        <Button
          fullWidth
          variant="contained"
          disabled={!roomName || !userName}
          onClick={() => props.joinRoom({ roomName, userName })}
        >
          Join Room
        </Button>
      </CardContent>
      {props.error && <Alert severity="error">{props.error}</Alert>}
    </Paper>
  );
};

export default Login;
