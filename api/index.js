const { getInterface } = require("stremio-addon-sdk");
// O la estructura que tengas para tu addon de Stremio, adaptada para exportar el servidor:

const addonInterface = require("../addon"); // O tu lógica principal del addon

module.exports = function (req, res) {
  addonInterface.runHTTP(req, res);
};
