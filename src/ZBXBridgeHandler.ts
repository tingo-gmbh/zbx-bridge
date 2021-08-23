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
   * @param zabbixHost
   * @param zabbixSenderPath
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

    loadedCommand.forEach((command: any) => {
      // Check if correct type was set.
      if (!["sender", "api"].includes(command.type)) {
        throw "Invalid type set.";
      }

      if (command.type === "sender") {
        return this.runZabbixSender(
            command.name,
            command.key,
            command.value
        );
      }

      if (command.type === "api") {
        try {
          let response = {};
          if (command.hostmacroid) {
            response = this.updateHostMacro(
                command.hostmacroid,
                command.value
            );
          } else if (loadedCommand.globalmacroid) {
            response = this.updateGlobalMacro(
                command.globalmacroid,
                command.value
            );
          }

          // Stop in case of error and return message.
          if (response) {
            if (response.hasOwnProperty('error')) {
              Logger.logError(JSON.stringify(response['error']));
              return "Failed to run macro.";
            }
          }
        } catch (error) {
          if (error) {
            Logger.logError(JSON.stringify(error));
            return "Failed to run macro.";
          }
        }
      }
    });

    return "Received command.";
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
      return execSync(zabbixSenderCommand, { stdio: [0] });
    } catch (exception) {
      Logger.logError(exception.toString());
      return "Failed to run zabbix sender.";
    }
  }

  /**
   * Update a host macro using the zabbix API.
   * @param hostmacroid
   * @param value
   */
  private async updateHostMacro(hostmacroid: string, value: string) {
    try {
      const response = await axios.post(`${this.apiHost}/api_jsonrpc.php`, {
        jsonrpc: "2.0",
        method: "usermacro.update",
        params: {
          hostmacroid,
          value,
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

  /**
   * Update a host macro using the zabbix API.
   * @param globalmacroid
   * @param value
   */
  private async updateGlobalMacro(globalmacroid: string, value: string) {
    try {
      const response = await axios.post(`${this.apiHost}/api_jsonrpc.php`, {
        jsonrpc: "2.0",
        method: "usermacro.updateglobal",
        params: {
          globalmacroid,
          value,
        },
        auth: this.apiAuth,
        id: 1,
      });
      return response.data;
    } catch (exception) {
      Logger.logError(exception.toString());
      return {
        error: "Failed to update global macro.",
      };
    }
  }
}

export default ZBXBridgeHandler;
