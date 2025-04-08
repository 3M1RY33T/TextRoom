// import { useState, useEffect, useRef } from "react";
// import {
//   Paper,
//   CardHeader,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
// } from "@mui/material";
// import io from "socket.io-client";

// const Socket = () => {
//   const [text, setText] = useState("");
//   const [log, setLog] = useState([]);

//   const appendToLog = (newLine) =>
//     setLog((currentLog) => [...currentLog, newLine]);
//   const renderLog = () =>
//     log.map((line, index) => (
//       <div key={index}>
//         <Typography variant="h6">{line}</Typography>
//       </div>
//     ));

//   const effectRan = useRef(false);
//   const socket = useRef();

//   const connectToServer = () => {
//     if (effectRan.current) return;

//     try {
//       appendToLog("Trying to connect...");

//       const ws = io.connect("localhost:9000", {
//         forceNew: true,
//         transports: ["websocket"],
//       });

//       ws.on("connect", () => appendToLog("Client connected"));
//       ws.on("disconnect", () => appendToLog("Client disconnected"));
//       ws.on("a hello from the server", appendToLog);
//       ws.on("room update", appendToLog);
//       ws.on("a lab-14 broadcast", appendToLog);
//       socket.current = ws;
//       effectRan.current = true;
//     } catch (e) {
//       console.warn(e);
//     }
//   };
//   const emitEvent = (data) => {
//     // Send the message to the "lab-14" room
//     socket.current.emit("broadcast to lab-14", data);
//   };
//   useEffect(() => {
//     connectToServer();
//   }, []);

//   return (
//     <>
//       <Paper elevation={4} sx={{ mt: "0.5em" }}>
//         <CardContent>
//           <CardHeader title="Emit Event From Client" />
//           <TextField
//             fullWidth
//             label="Event Data"
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//           />
//           <Button
//             fullWidth
//             variant="contained"
//             sx={{ mt: "1em" }}
//             onClick={() => emitEvent(text)}
//           >
//             Emit Event
//           </Button>
//         </CardContent>
//       </Paper>
//       <Paper elevation={4} sx={{ mt: "0.5em" }}>
//         <CardHeader title="Log" />
//         <CardContent>{renderLog()}</CardContent>
//       </Paper>
//     </>
//   );
// };

// export default Socket;
