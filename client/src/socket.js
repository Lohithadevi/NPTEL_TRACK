import { io } from 'socket.io-client';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const socket = io(BASE_URL);

export default socket;
