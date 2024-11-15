const httpStatusInstance = require('http-status-codes');
const path = require('path');
const fsInstance = require('fs');
const { PATHNAME_TO_FILEPATH, NOT_FOUND_FILEPATH } = require('./routes')
const { STATIC_CONTENT_FOLDER, IMAGE_FOLDER } = require('./constants')
const AVAILABLE_IMAGE_EXTENSIONS = require('./image-extensions')

const handleRequest = (req, res) => {

    if (req.url.endsWith('.js')) {
        handleJsFilesRequest(req, res)
        return
    }
    if (req.url.endsWith('.css')) {
        handleCssFileRequest(req, res)
        return
    }
    const isImageRequest = Object.values(AVAILABLE_IMAGE_EXTENSIONS).some(extension => req.url.endsWith(extension))
    if (isImageRequest) {
        handleImageRequest(req, res)
        return
    }

    handleHTMLRequest(req, res)
}

const handleHTMLRequest = (req, res) => {
    res.writeHead(httpStatusInstance.StatusCodes.OK, {
        "Content-Type": "text/html"
    });
    
    const basePath = new URL(req.url, `http://${req.headers.host}`).pathname;
    const responseFilepath = PATHNAME_TO_FILEPATH.get(basePath);

    if (responseFilepath) {
        readFile(responseFilepath, res);
    } else {
        readFile(NOT_FOUND_FILEPATH, res);
    }
}

const handleJsFilesRequest = (req, res) => {
    res.writeHead(httpStatusInstance.StatusCodes.OK, {
        "Content-Type": "application/javascript"
    });

    readFile(path.join(STATIC_CONTENT_FOLDER, req.url), res)
}

const handleCssFileRequest = (req, res) => {
    res.writeHead(httpStatusInstance.StatusCodes.OK, {
        "Content-Type": "text/css"
    });

    readFile(path.join(STATIC_CONTENT_FOLDER, req.url), res)
}

const handleImageRequest = (req, res) => {

    if (req.url.endsWith(AVAILABLE_IMAGE_EXTENSIONS.PNG)) {
        res.writeHead(httpStatusInstance.StatusCodes.OK, {
            "Content-Type": "image/png"
        });
    } else if (req.url.endsWith(AVAILABLE_IMAGE_EXTENSIONS.JPEG) || req.url.endsWith(AVAILABLE_IMAGE_EXTENSIONS.JPG)) {
        res.writeHead(httpStatusInstance.StatusCodes.OK, {
            "Content-Type": "image/jpeg"
        });
    } else if (req.url.endsWith(AVAILABLE_IMAGE_EXTENSIONS.GIF)) {
        res.writeHead(httpStatusInstance.StatusCodes.OK, {
            "Content-Type": "image/gif"
        });
    } else if (req.url.endsWith(AVAILABLE_IMAGE_EXTENSIONS.WEBP)) {
        res.writeHead(httpStatusInstance.StatusCodes.OK, {
            "Content-Type": "image/webp"
        });
    } else if (req.url.endsWith(AVAILABLE_IMAGE_EXTENSIONS.SVG)) {
        res.writeHead(httpStatusInstance.StatusCodes.OK, {
            "Content-Type": "image/svg+xml"
        });
    }

    readFile(path.join(IMAGE_FOLDER, req.url), res)
}


const readFile = (filePath, res) => {
    fsInstance.readFile(filePath, (error, data) => {
        if (error) {
            console.error(error);
            handleError(res);
            return;
        }

        res.write(data);
        res.end();
    });
};

const handleError = (res) => {
    if (!res.headersSent) {
        res.writeHead(httpStatusInstance.StatusCodes.INTERNAL_SERVER_ERROR, {
            "Content-Type": "text/html"
        });
        res.end("<h1>500 - Internal Server Error</h1>");
    }
};

module.exports = handleRequest