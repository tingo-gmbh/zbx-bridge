import * as fs from "fs";

class Logger {
  /**
   * Log error to file.
   * @param message
   */
  static logError(message: string) {
    fs.appendFile("./logs/error.log", message + "\r\n", function (err) {
      if (err) throw err;
    });
  }
}

export default Logger;
