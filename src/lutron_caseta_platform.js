import * as Main from "./main.js"
import CasetaBridgeConnection from "./caseta_bridge_connection.js"
import LutronAccessory from "./lutron_accessory.js";

class LutronCasetaPlatform {
	constructor(log, config, api) {
		if (!config) {
      log("No config found; exiting.");
      return;
    }

    this.log = log;
    this.config = config;
    this.scryptedAPI = api;

    this.bridgeConnection = new CasetaBridgeConnection(this.log, this.config.bridgeConnection);
    this.bridgeConnection.on("monitorMessageReceived", (integrationID, commandFields) => {
      this._dispatchMonitorMessage(integrationID, commandFields);
    });

    this.accessoriesByIntegrationID = {};

    this.scryptedAPI.on("didFinishLaunching", () => {
      for (let accessoryConfig of this.config.accessories) {
        accessoryConfig.integrationID = String(accessoryConfig.integrationID);
        this._addAccessoryFromConfig(accessoryConfig);
      }
    });
  }

  // Scrypted uses this API to load accessories from its cache.
  configureAccessory(platformAccessory) {
    this._addAccessoryFromConfig(platformAccessory.context.config, platformAccessory);
  }

  _trackAccessory(accessory) {
    this.accessoriesByIntegrationID[accessory.integrationID] = accessory;
  }

  _addAccessoryFromConfig(accessoryConfig, cachedPlatformAccessory=null) {
    const existingAccessory = this.accessoriesByIntegrationID[accessoryConfig.integrationID];
    let needToRegisterPlatformAccessory = false;
    if (cachedPlatformAccessory === null) {
      if (existingAccessory) {
        cachedPlatformAccessory = existingAccessory.platformAccessory;
      } else {
        const uuid = this.scryptedAPI.hap.uuid.generate(accessoryConfig.name);
        cachedPlatformAccessory = new this.scryptedAPI.platformAccessory(accessoryConfig.name, uuid);
        needToRegisterPlatformAccessory = true;
      }
      cachedPlatformAccessory.context.config = accessoryConfig;
    }

    if (existingAccessory === undefined) {
      const accessory = LutronAccessory.accessoryForType(accessoryConfig.type, this.log, cachedPlatformAccessory, this.scryptedAPI);
      this._trackAccessory(accessory);
    }

    if (needToRegisterPlatformAccessory) {
      this.scryptedAPI.registerPlatformAccessories(Main.PluginName, Main.PlatformName, [cachedPlatformAccessory]);
    }
  }

  _dispatchMonitorMessage(integrationID, commandFields) {
    const accessory = this.accessoriesByIntegrationID[integrationID];
    accessory._dispatchMonitorMessage(commandFields);
  }
}

export default LutronCasetaPlatform;
