const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;

const { logEvents } = require("./logEvents");
const EventEmmiter = require("events");
class Emmiter extends EventEmmiter {}

//initialize event emmiter object
const myEmmiter = new Emmiter();

//here we listen for the log event emmiter to get fired up
myEmmiter.on("log", (msg, fileName) => logEvents(msg, fileName));

//get the port from environment variables (from host) or use the provided port
const PORT = process.env.PORT || 3333;

//this function will serve requested pages to the client
const serveFile = async (filePath, contentType, response) => {
  try {
    //we await until requested file is read
    //if the content type does't include image in it then read the file with UTF8 encoding
    const rawData = await fsPromises.readFile(
      filePath,
      !contentType.includes("image") ? "utf8" : ""
    );

    //we parse the rawData as json if contentType is application/json
    const data =
      contentType === "application/json" ? JSON.parse(rawData) : rawData;

    //if filePath contains 404.html responde with 404 status code, else with 200(success)
    response.writeHead(filePath.includes("404.html") ? 404 : 200, {
      "Content-Type": contentType,
    });

    response.end(
      //we send the response as json if contentType is application/json
      contentType === "application/json" ? JSON.stringify(data) : data
    );
  } catch (err) {
    console.log(err);
    //every time server fails to respond with a file, the cause error will be recorded in errLog.txt
    myEmmiter.emit("log", `${err.name}: ${err.message}`, "errLog.txt");
    response.statusCode = 500; //internal server error
    response.end();
  }
};

//create a new server
const server = http.createServer((req, res) => {
  //log the url and method of the request
  console.log(req.url, req.method);

  //every time a request is made we make a record in the reqLog.txt
  myEmmiter.emit("log", `${req.url}\t${req.method}`, "reqLog.txt");

  //get the extension of the req url
  const extension = path.extname(req.url);

  let contentType;

  //use this switch to set the contentType requested based on the extension that came with request
  switch (extension) {
    case ".css":
      contentType = "text/css";
      break;
    case ".js":
      contentType = "text/javascript";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".jpg":
      contentType = "image/jpg";
      break;
    case ".jpeg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".txt":
      contentType = "text/plain";
      break;
    default:
      contentType = "text/html";
  }

  //set the value of the response filePath based on the request url and contentType
  let filePath =
    contentType === "text/html" && req.url === "/"
      ? path.join(__dirname, "views", "index.html")
      : contentType === "text/html" && req.url.slice(-1) === "/" //last character in the req url is "/" - subdir refference
      ? path.join(__dirname, "views", req.url, "index.html")
      : contentType === "text/html"
      ? path.join(__dirname, "views", req.url)
      : path.join(__dirname, req.url);

  //we allow .html extension to be ommited in the browser
  if (!extension && req.url.slice(-1) !== "/") {
    filePath += ".html";
  }

  //check if filePath exists
  const fileExits = fs.existsSync(filePath);

  if (fileExits) {
    //serve the file requested
    serveFile(filePath, contentType, res);
  } else {
    switch (path.parse(filePath).base) {
      case "old-page.html":
        //301 - redirect
        res.writeHead(301, { Location: "/new-page.html" });
        res.end();
        break;
      case "www-page.html":
        //301 - redirect
        res.writeHead(301, { Location: "/" });
        res.end();
        break;
      default:
        //serve a 404 - not found
        serveFile(path.join(__dirname, "views", "404.html"), "text/html", res);
    }
  }
});

//the server will listen for requests at the provided port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
