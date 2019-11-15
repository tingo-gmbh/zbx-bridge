import * as express from "express";
import { config } from "dotenv";
import { resolve } from "path";
import { address } from "ip";
import { execSync } from "child_process";
const app = express();

// Load dot env file
config({ path: resolve(__dirname, "./../.env") });

// Route definitions
app.get("/", (req, res) => {
  if (process.env[req.query.command]) {
    const [s, k] = process.env[req.query.command].split(",");
    const zabbixSenderCommand = `/usr/local/bin/zabbix_sender -z ${address()} -s "${s}" -k "${k}" -o "${req.query.command}" -vv`;
    const stdout = execSync(zabbixSenderCommand);
    res.send(`Output: ${stdout}`);
  } else {
    res.send(`Command not found!`);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
