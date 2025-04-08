let users = new Set();

class Room {

  static #rooms = {};

  static get(roomName) {
      if (!Room.#rooms[roomName]) {
          Room.#rooms[roomName] = new Room(roomName);
      }
      return this.#rooms[roomName];
  }

  #name = "";
  #log = [];

  #typingUsers = new Set();

  constructor(name) {
      this.#name = name;
  }

  get name() {
      return this.#name;
  }

  get log() {
      return this.#log;
  }

  get typingUsers() {
      return this.#typingUsers;
  }

  roomLog = roomName => {
    return Room.get(roomName).log;
  }

  addMessage(messageInfo) {
      messageInfo.timestamp = Date.now();
      this.#log.push(messageInfo);
  }

  updateTypingStatus(userName, isTyping) {
      if (isTyping) {
          this.#typingUsers.add(userName);
      }
      else {
          this.#typingUsers.delete(userName);
      }
  }
  
}

const updateTypingStatus = (roomName, userName, isTyping) => {
const room = Room.get(roomName);
    if (isTyping) {
        room.typingUsers.add(userName);
    } else {
        room.typingUsers.delete(userName);
}
return Array.from(room.typingUsers);
};

const getTypingUsers = (roomName) => {
  return Array.from(Room.get(roomName).typingUsers);
}
let testRoom = new Room("test");

console.log(testRoom.name);

console.log(testRoom.name);

const registerUser = (userName) => {
  users.add(userName);
  console.log(`User registered: ${userName}`);
};

const unregisterUser = (userName) => {
  users.delete(userName);
  console.log(`User removed: ${userName}`);
};

const isUserNameTaken = (userName) => {
  return users.has(userName);
};

let roomLogs = {};
const roomLog = (room) => roomLogs[room];
const addMessage = (room, messageInfo) => {
  if (!roomLogs[room]) {
    roomLogs[room] = [];
  }
  roomLogs[room].push({
    ...messageInfo,
    timestamp: Date.now(),
  });
};

export {     
  registerUser,
  unregisterUser,
  isUserNameTaken,
  roomLog,
  addMessage,
  updateTypingStatus,
  getTypingUsers 
};
