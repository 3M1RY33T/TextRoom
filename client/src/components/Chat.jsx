import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  TextField,
  Button,
  List,
  Stack,
  Drawer,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import { format, getDay } from "date-fns";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupsIcon from '@mui/icons-material/Groups';

const Chat = (props) => {
  /* Menu State */
  const [menuOpen, setMenuOpen] = useState(false);
  /* Message State */
  const [messageText, setMessageText] = useState("");
  const [typingMessage, setTypingMessage] = useState("");
  const lastMessageRef = useRef(null);
  const typingTimeout = useRef(null);
  const prevRoomUsersRef = useRef([]);
  const { roomUsers = [], roomName, userName } = props;

  /* Chat Log */

  /* Menu Content */
  const renderMenu = () => {
    return (
      <Box sx={{ width: 250, p: 2 }}>
        <Typography variant="h6">Room Info</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography>
          <strong>Room:</strong> {props.roomName}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Active Users:</strong> {props.roomUsers.length}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ maxHeight: 200, overflow: "auto" }}>
          {props.roomUsers.length > 0 ? (
            props.roomUsers.map((user) => (
              <Box
                key={`${user.userName}-${user.id}`}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#000",
                    mr: 1,
                  }}
                />
                <Typography>{user.userName}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No users in room</Typography>
          )}
        </Box>
      </Box>
    );
  };


  /* Render Message */
  const renderMessage = (message, index) => {
    if (message.deletedAt) {
      return (
        <div key={index} ref={lastMessageRef} className="meta-message">
          <Typography variant="h6" textAlign="center">
            <i>(deleted)</i>
          </Typography>
          {message.timestamp && (
            <Typography variant="body2" textAlign="center">
              <i>{format(new Date(message.timestamp), "HH:mm")}</i>
            </Typography>
          )}
        </div>
      );
    }
    if (message.typingFeedback) {
      return (
        <div key={message.key || `typing-feedback-${Date.now()}`} ref={lastMessageRef}>
          <Typography variant="body2" textAlign="center" sx={{ marginBottom: "1em" }}>
            <i>{message.text}</i>
          </Typography>
        </div>
      );
    }
    /* Timestamp */
    const messageTimestamp = message.timestamp ? format(new Date(message.timestamp), "HH:mm") : "";

    /* New Day Messages */
    if (message.newDay) {
      return (
        <div key={index} className="day-message">
          <Typography variant="h6" textAlign="center">
            <strong>{message.text}</strong>
          </Typography>
        </div>
      );
    }

    /* Meta Chat Messages */
    if (!message.sender) {
      return (
        <div key={index} ref={lastMessageRef} className="meta-message">
          <Typography variant="h6" textAlign="center">
            <i>{message.text}</i>
          </Typography>
          {messageTimestamp && (
            <Typography variant="body2" textAlign="center">
              <i>{messageTimestamp}</i>
            </Typography>
          )}
        </div>
      );
    }

    /* User Messages */
    const isCurrentUser = message.sender === props.userName;

    return (
      <Box
        key={index}
        ref={lastMessageRef}
        sx={{
          display: "flex",
          justifyContent: isCurrentUser ? "flex-end" : "flex-start",
          mb: 2,
          px: 1,
        }}
      >
        <Box
          className="message-bubble"
          sx={{
            position: "relative",
            maxWidth: "70%",
            p: 2,
            borderRadius: 2,
            backgroundColor: isCurrentUser ? "#e3f2fd" : "#ffffff",
            boxShadow: 3,
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              width: 0,
              height: 0,
              border: "10px solid transparent",
              borderTopColor: isCurrentUser ? "#e3f2fd" : "#ffffff",
              [isCurrentUser ? "right" : "left"]: "-10px",
            },
          }}
        >
          {!isCurrentUser && (
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: message.color }}
            >
              {message.sender}
            </Typography>
          )}
          <Typography variant="body1">{message.text}</Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="right"
          >
            {message.editedAt && <i>(edited) </i>}
            {messageTimestamp}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderChatLog = () => {
    const chat = props.chatLog ?? [];
    const chatWithSpecialMessages = [];

    let lastMessage = null;
    chat.forEach(message => {
      if (!lastMessage || getDay(lastMessage.timestamp) != getDay(message.timestamp)) {
        chatWithSpecialMessages.push({
          sender: '',
          text: format(message.timestamp, "PPPP"),
          newDay: true
        });
      }
      chatWithSpecialMessages.push(message);
      lastMessage = message;
    });

    return chatWithSpecialMessages.map(renderMessage);
  }

  const handleSendMessage = () => {
    if (!messageText) return;

    const { userName, roomName } = props;
    const clearTyping = () => {
        props.notifyTyping && props.notifyTyping({
            roomName,
            userName,
            isTyping: false
        });
        setMessageText('');
    };
    
    if (messageText.startsWith("/edit ")) {
        const newText = messageText.slice(6).trim();
        const lastMessage = [...props.chatLog].reverse().find(
            (m) => m.sender === props.userName && !m.deletedAt
        );

        if (lastMessage) {
            const editInfo = {
                userName: props.userName,
                roomName: props.roomName,
                text: newText,
                originalTimestamp: lastMessage.timestamp,
            };
            props.socket.emit("edit", editInfo);
        }
        clearTyping();
        return;
    }

    if (messageText === "/del") {
        const lastMessage = [...props.chatLog].reverse().find(
            (m) => m.sender === props.userName && !m.deletedAt
        );

        if (lastMessage) {
            const deleteInfo = {
                userName: props.userName,
                roomName: props.roomName,
                originalTimestamp: lastMessage.timestamp,
            };
            props.socket.emit("delete", deleteInfo);
        }
        clearTyping();
        return;
    }

    props.sendMessage(messageText);
    clearTyping();
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [props.chatLog, props.typingUsers]);

  useEffect(() => {
    const prevUsers = prevRoomUsersRef.current.map((u) => u.userName);
    const currentUsers = roomUsers.map((u) => u.userName);

    const joined = currentUsers.filter((u) => !prevUsers.includes(u));
    const left = prevUsers.filter((u) => !currentUsers.includes(u));

    joined.forEach((name) => {
      console.log(`${name} joined the room`);
    });

    left.forEach((name) => {
      console.log(`${name} left the room`);
    });

    prevRoomUsersRef.current = roomUsers;
  }, [roomUsers]);

  useEffect(() => {
    const typing = (props.typingUsers || [])
      .filter(user => {
        const name = typeof user === "string" ? user : user.userName;
        return name !== props.userName;
      })
      .map(user => (typeof user === "string" ? user : user.userName));

    if (typing.length > 0) {
      let text = "";

      if (typing.length === 1) {
        text = `${typing[0]} is typing...`;
      } else if (typing.length === 2) {
        text = `${typing[0]} and ${typing[1]} are typing...`;
      } else {
        text = "Multiple users are typing...";
      }

      setTypingMessage(text);
    } else {
      setTypingMessage("");
    }
  }, [props.typingUsers, props.userName]);

  const messageTextRef = useRef(messageText);

  const handleMessageTextChange = (e) => {
    const newText = e.target.value;
    setMessageText(newText);

    const { userName, roomName } = props;
    props.notifyTyping && props.notifyTyping({
        roomName,
        userName,
        isTyping: newText.length > 0
    });

    messageTextRef.current = newText;
  };

  const getCurrentDate = () => {
    return format(new Date(), "PPPP");
  };

  /* Render Component */

  return (
    <Paper elevation={4} sx={{ mt: "0.5em", display: "flex", flexDirection: "column" }}>
      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        {renderMenu()}
      </Drawer>

      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          pl: 2,
          pr: 2,
          py: 1,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setMenuOpen(true)}
          sx={{ minWidth: 40, height: 40 }}
        >
          <GroupsIcon />
        </Button>

        <CardHeader
          title={props.roomName}
          sx={{ p: 0 }}
          titleTypographyProps={{ variant: "h6" }}
        />

        <Button
          variant="contained"
          onClick={props.leaveRoom}
          sx={{ minWidth: 40, height: 40 }}
          color="error"
        >
          <ExitToAppIcon />
        </Button>
      </Stack>

      <Divider />

      {/* Chat Content */}
      <CardContent>
        <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          {getCurrentDate()}
        </Typography>

        <Box sx={{ height: "60vh", display: "flex", flexDirection: "column" }}>
          <List sx={{ flexGrow: 1, overflowY: "auto", textAlign: "left" }}>
            {renderChatLog()}
          </List>

          {props.typingUsers && props.typingUsers.filter(user => user !== props.userName).length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                py: 1,
                px: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: 1
              }}
            >
              {props.typingUsers.filter(user => user !== props.userName).length === 1
                ? `${props.typingUsers.filter(user => user !== props.userName)[0]} is typing...`
                : `${props.typingUsers.filter(user => user !== props.userName).length} people are typing...`
              }
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            value={messageText}
            onChange={handleMessageTextChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!messageText}
            sx={{ minWidth: 56 }}
          >
            <SendIcon />
          </Button>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default Chat;
