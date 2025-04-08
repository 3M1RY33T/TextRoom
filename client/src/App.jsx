import { useState, useEffect, useRef } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import io from "socket.io-client";
import Header from "./components/Header";
import Login from "./components/Login";
import Chat from "./components/Chat";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00008B",
      light: "#ADD8E6"
    },
    secondary: {
      main: "#0000FF",
      light: "#ADD8E6"
    },
  },
});
/* App Component */
function App() {
  const [roomUsers, setRoomUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  /* Login */
  const [joinInfo, setJoinInfo] = useState({
    userName: "",
    roomName: "",
    error: "",
  });

  const hasJoined = () =>
    joinInfo.userName && joinInfo.roomName && !joinInfo.error;
  const joinRoom = (joinData) => socket.current.emit("join", joinData);

  /* Chat */

  const [chatLog, setChatLog] = useState([]);
  const sendMessage = (text) => {
    socket.current.send(text);
  };

  const notifyTyping = (typingInfo) => {
    socket.current.emit("typing", typingInfo);
}

  /* WebSocket */

  const effectRan = useRef(false);
  const socket = useRef();

  const connectToServer = () => {
    if (effectRan.current) return;

    try {
      const wsServerAddress =
        window.location.port == 5173 ? "localhost:9000" : "/";
      const ws = io.connect(wsServerAddress, { transports: ["websocket"] });

      ws.on("join-response", setJoinInfo);
      ws.on("chat update", setChatLog);
      ws.on("room users", (users) => {
        console.log('Initial room users received:', users);
        setRoomUsers(users);
      });
      ws.on("typing", data => console.log(data));
      socket.current = ws;
      effectRan.current = true;
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    connectToServer();
  }, []);

  const leaveRoom = () => {
    if (socket.current) {
      socket.current.disconnect();
      setJoinInfo({
        userName: "",
        roomName: "",
        error: "",
      });
      setChatLog([]);
    }
  };
  useEffect(() => {
    if (!hasJoined()) return;

    const handleRoomUsers = (users) => {
      console.log('Room users updated:', users);
      setRoomUsers(prev => {
        const newUsers = Array.isArray(users) ? users : [];
        console.log('Updating room users from:', prev, 'to:', newUsers);
        return newUsers;
      });
    };
    
    const handleUserActivity = (activity) => {
      console.log('User activity:', activity);
      socket.current.emit('request users', { roomName: joinInfo.roomName });
    };

    const handleEdit = (editedMessage) => {
      setChatLog(prevLog =>
        prevLog.map(msg =>
          msg.sender === editedMessage.sender &&
          msg.timestamp === editedMessage.timestamp
            ? { ...msg, text: editedMessage.text, editedAt: editedMessage.editedAt }
            : msg
        )
      );
    };

    const handleDelete = (deleteInfo) => {
      setChatLog(prevLog =>
        prevLog.map(msg =>
          msg.sender === deleteInfo.userName &&
          !msg.deletedAt
            ? { ...msg, text: "", deletedAt: Date.now() }
            : msg
        )
      );
    };

    const handleUserJoined = (data) => {
      setChatLog(prev => [...prev, {
        sender: '',
        text: `${data.userName} has joined the room`,
        timestamp: new Date(),
        isSystemMessage: true
      }]);
    };

    socket.current.on("room users", handleRoomUsers);
    socket.current.on("user activity", handleUserActivity);
    socket.current.on("user joined", handleUserJoined);
    socket.current.on("typing", (users) => {
      setTypingUsers(users);
    });
    socket.current.on("edit", handleEdit);
    socket.current.on("delete", handleDelete);
    socket.current.emit('request users', { roomName: joinInfo.roomName });

    return () => {
      socket.current.off("room users", handleRoomUsers);
      socket.current.off("user activity", handleUserActivity);
      socket.current.off("user joined", handleUserJoined);
      socket.current.off("edit", handleEdit);
      socket.current.off("delete", handleDelete);
      socket.current.off("typing");
    };
  }, [hasJoined()]);

  /* App Rendering */

  return (
    <ThemeProvider theme={theme}>
      <Header title="TextMe - Yigit Yildiz" />
      {hasJoined() ? (
        <Chat
          key={`${joinInfo.userName}-${joinInfo.roomName}`}
          {...joinInfo}
          roomUsers={roomUsers}
          chatLog={chatLog}
          typingUsers={typingUsers}
          sendMessage={sendMessage}
          notifyTyping={notifyTyping}
          leaveRoom={leaveRoom}
          socket={socket.current}
        />
      ) : (
        <Login joinRoom={joinRoom} error={joinInfo.error} />
      )}
    </ThemeProvider>
  );
}

export default App;
