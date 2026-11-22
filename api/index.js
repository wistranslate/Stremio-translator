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
    return { subtitles: [] };
});

// Render asigna el puerto automáticamente con process.env.PORT
const port = process.env.PORT || 7000;

serveHTTP(builder.getInterface(), { port });

console.log(`Addon de Stremio activo en el puerto ${port}`);
