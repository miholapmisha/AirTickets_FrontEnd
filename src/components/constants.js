const path = require("path");

const STATIC_CONTENT_FOLDER = path.join(__dirname, "../../static");
const PAGE_FOLDER = path.join(__dirname, "../../pages");
const IMAGE_FOLDER = path.join(__dirname, "../../images");

module.exports = {
    STATIC_CONTENT_FOLDER,
    PAGE_FOLDER,
    IMAGE_FOLDER
};