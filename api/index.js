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
    console.log("Petición de subtítulos para ID:", args.id);

    // URL directa al archivo srt que acabamos de subir en GitHub
    return {
        subtitles: [
            {
                id: "traducido_es_1",
                url: "https://raw.githubusercontent.com/wistranslate/Stremio-translator/main/empty.srt",
                lang: "es"
            }
        ]
    };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });

console.log(`Addon activo en el puerto ${port}`);
