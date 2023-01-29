//NPM modules
const { v4: uuid } = require("uuid");
const { format } = require("date-fns");

//Common core modules
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logName) => {
  //take the event date and time
  const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
  //add unique id and message to each event date and time
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  //log the event
  console.log(logItem);
  try {
    //create a new logs directory if not exists
    if (!fs.existsSync(path.join(__dirname, "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "logs"), (err) => {
        if (err) throw err;
        console.log("Logs directory created.");
      });
    }
    //add the log to a logs file
    await fsPromises.appendFile(path.join(__dirname, "logs", logName), logItem);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { logEvents };
