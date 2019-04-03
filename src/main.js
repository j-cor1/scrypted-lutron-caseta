import LutronCasetaPlatform from "./lutron_caseta_platform.js"

const PluginName = "scrypted-lutron-caseta";
const PlatformName = "Lutron Caseta Smart Bridge Pro";
let Accessory, Service, Characteristic, UUIDGen;

export default function(scrypted) {
  Accessory = scrypted.platformAccessory;
  Service = scrypted.hap.Service;
  Characteristic = scrypted.hap.Characteristic;
  UUIDGen = scrypted.hap.uuid;

  scrypted.registerPlatform(PluginName, PlatformName, LutronCasetaPlatform, true);
}

export {PluginName, PlatformName};
