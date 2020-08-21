"use strict";

import * as fs from "fs";
import { execSync } from "child_process";
import axios from "axios";
import Logger from "./Logger";

class ZBXBridgeHandler {
  /**
   * Zabbix host.
   */
  zabbixHost: string;

  /**
   * Zabbix host.
   */
  zabbixSenderPath: string;

  /**
   * Zabbix API host.
   */
  apiHost: string;

  /**
   * Zabbix API host key.
   */
  apiAuth: string;

  /**
   * Create new handler.
   * @param zbxHost
   * @param apiHost
   * @param apiAuth
   */
  public constructor(
    zabbixHost: string,
    zabbixSenderPath: string,
    apiHost: string,
    apiAuth: string
  ) {
    this.zabbixHost = zabbixHost;
    this.zabbixSenderPath = zabbixSenderPath;
    this.apiHost = apiHost;
    this.apiAuth = apiAuth;
  }

  /**
   * Process an incoming command.
   * @param command
   */
  public async processCommand(command: string) {
    // Check if a command was actually set.
    if (!command) {
      throw "No command set.";
    }

    // Check if command is defined.
    const commands = this.loadCommands();
    const loadedCommand = commands[command];
    if (!loadedCommand) {
      throw "Command could not be found.";
    }

    // Check if correct type was set.
    if (!["sender", "api"].includes(loadedCommand.type)) {
      throw "Invalid type set.";
    }

    if (loadedCommand.type === "sender") {
      return this.runZabbixSender(
        loadedCommand.name,
        loadedCommand.key,
        loadedCommand.value
      );
    }

    if (loadedCommand.type === "api") {
      const response = await this.updateHostMacro(
        loadedCommand.hostmacroid,
        loadedCommand.value
      );

      if (response.error) {
        Logger.logError(JSON.stringify(response));
        return "Failed to update host macro.";
      }

      return "Updated host macro.";
    }
  }

  /**
   * Load commands from config file.
   */
  private loadCommands() {
    return JSON.parse(fs.readFileSync("./commands.json", "utf8"));
  }

  /**
   * Run zabbix sender.
   * @param key
   * @param value
   * @param name
   */
  private runZabbixSender(name: string, key: string, value) {
    const zabbixSenderCommand = `${this.zabbixSenderPath} -z "${this.zabbixHost}" -s "${name}" -k "${key}" -o "${value}" -vv`;
    try {
      let response = execSync(zabbixSenderCommand, { stdio: [0] });
      return response;
    } catch (exception) {
      Logger.logError(exception.toString());
      return "Failed to run zabbix sender.";
    }
  }

  /**
   * Update a host macro using the zabbix API.
   * @param key
   * @param value
   */
  private async updateHostMacro(hostmacroid: string, value: string) {
    try {
      const response = await axios.post(`${this.apiHost}/api_jsonrpc.php`, {
        jsonrpc: "2.0",
        method: "usermacro.update",
        params: {
          hostmacroid: hostmacroid,
          value: value,
        },
        auth: this.apiAuth,
        id: 1,
      });
      return response.data;
    } catch (exception) {
      Logger.logError(exception.toString());
      return {
        error: "Failed to update host macro.",
      };
    }
  }
}

export default ZBXBridgeHandler;
