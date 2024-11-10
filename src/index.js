const httpInstance = require('http')
const handleRequest = require('./components/request-handlers');
const PORT = 3000;

const httpServer = httpInstance.createServer((req, res) => handleRequest(req, res));
httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});