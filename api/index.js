const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    id: "community.stremio.translator",
    version: "1.0.0",
    name: "Traductor de Subtítulos",
    description: "Traductor de subtítulos al español",
    resources: ["subtitles"],
    types: ["movie", "series"],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(async function(args) {
    return { subtitles: [] };
});

module.exports = function(req, res) {
    const sdkInterface = builder.getInterface();
    serveHTTP(sdkInterface, { req, res, cache: maxAge = 0 });
};
