const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();



const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// eslint-disable-next-line no-undef
io = require('socket.io')(server);
// eslint-disable-next-line no-undef
io.on('connection', (socket) => {
  console.log('Connection Establish!!!!! - ' + socket.id);
});