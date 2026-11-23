const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    id: "community.stremio.translator.es",
    version: "1.0.0",
    name: "Traductor Automático ES",
    description: "Traduce subtítulos al español automáticamente para Stremio",
    resources: ["subtitles"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(async function(args) {
    console.log("Petición de subtítulos para:", args.id);

    // Estructura válida para que Stremio desbloquee y permita seleccionar el español
    return {
        subtitles: [
            {
                id: "traducido_es",
                url: "https://raw.githubusercontent.com/wistranslate/Stremio-translator/main/empty.srt",
                lang: "es",
                format: "srt"
            }
        ]
    };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });

console.log(`Addon activo en el puerto ${port}`);
