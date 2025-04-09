import Server from './Server.js';

const server = new Server();
server.bootstrap().catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
});