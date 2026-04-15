import { io } from 'socket.io-client';

// Single shared socket instance for the entire app
const socket = io('http://localhost:5000');

export default socket;
