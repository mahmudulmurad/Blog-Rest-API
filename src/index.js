const app = require('./app')
const port = process.env.PORT || 3004
const http = require('http');

http.createServer(app).listen(port, function () {
   console.log('Server started: Listening on port '+ port);
});
