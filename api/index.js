const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    id: "community.stremio.translator",
    version: "1.0.0",
    name: "Traductor de Subtítulos",
    description: "Traductor de subtítulos al español para Stremio",
    resources: ["subtitles"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(async function(args) {
    // Aquí irá la lógica de tus subtítulos
    return { subtitles: [] };
});

module.exports = function(req, res) {
    // Permitir CORS para la aplicación de Stremio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    const sdkInterface = builder.getInterface();
    serveHTTP(sdkInterface, { req, res, cache: 0 });
};
