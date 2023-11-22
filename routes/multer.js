const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname); // Get the file extension
    const Filename = uuidv4() + extension; // Append the extension to the filename
    cb(null, Filename);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
