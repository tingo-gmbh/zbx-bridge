import * as express from "express";
import * as morgan from "morgan";
import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";
import * as path from "path";
import ZBXBridgeHandler from "./ZBXBridgeHandler";
const app = express();

// Log all requests to file.
let accessLogStream = fs.createWriteStream(
  path.join(__dirname, "../logs/access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Load dot env file.
config({ path: resolve(__dirname, "./../.env") });

// Create ZBX bridge handler
const zbxBridgeHandler = new ZBXBridgeHandler(
  process.env.ZABBIX_HOST,
  process.env.ZABBIX_SENDER_PATH,
  process.env.API_HOST,
  process.env.API_AUTH
);

// Route definitions.
app.get("/", (req, res) => {
  zbxBridgeHandler
    .processCommand(req.query.command ? req.query.command.toString() : null)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(400).send(error.toString());
    });
});

// Start web server.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
