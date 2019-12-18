import * as express from "express";
import * as morgan from "morgan";
import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
const app = express();

// Log all requests to file
var accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))

// Load dot env file
config({ path: resolve(__dirname, "./../.env") });

// Route definitions
app.get("/", (req, res) => {
  if (process.env[req.query.command]) {
    const [o, s, k] = process.env[req.query.command].split(",");
    const zabbixHost = process.env.ZBX_HOST || '127.0.0.1';
    const zabbixSenderCommand = `/usr/local/bin/zabbix_sender -z ${zabbixHost} -s "${s}" -k "${k}" -o "${o}" -vv`;
    const stdout = execSync(zabbixSenderCommand);
    res.send(`Output: ${stdout}`);
  } else {
    res.send(`Command not found! Please check your .env file.`);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
