/*
    Primary file for the API
*/

// Dependencies
var http = require('http');
var StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
var server = http.createServer((req, res) => {

    // Get the URL and parse it
    var url = new URL(req.url, `http://${req.headers.host}`);

    // Get the path
    var path = url.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string
    var queryString = url.searchParams;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
        buffer += '/';
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Choose handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryString': queryString,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        // Route the request to the handler
        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.writeHead(statusCode);
            res.end(payloadString);

            //Log the response
            console.log('Returning this response: ', statusCode, payloadString);

        })
    });
});

// Start the server, and have it listen on port 3000
server.listen(3000, () => {
    console.log("Server listening on port 3000")
});


// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
    // Callback a http status code and a payload object
    callback(406, {'name' : 'sample handler'});
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Define a request router
var router = {
    'sample' : handlers.sample
};