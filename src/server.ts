import * as express from "express";
import { config } from "dotenv";
import { resolve } from "path";
import { address } from "ip";
import { execSync } from "child_process";
const app = express();

// Load dot env file
config({ path: resolve(__dirname, "./../.env") });

app.get("/", (req, res) => {
    const command = process.env[req.query.command];
    const zabbixSenderCommand = `/bin/zabbix_sender -z ${address()} -s "test" -k "tgo.test" -o "${command}" -vv`;
    const stdout = execSync(zabbixSenderCommand);
    res.send(`Output: ${stdout}`);
})

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
     console.log(`Server is running in http://localhost:${PORT}`)
})