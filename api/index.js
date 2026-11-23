const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    id: "community.stremio.translator.es",
    version: "1.0.1",
    name: "Traductor Automático ES",
    description: "Traduce subtítulos al español automáticamente para Stremio",
    resources: ["subtitles"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(async function(args) {
    console.log("Petición recibida para ID:", args.id);

    // Devolvemos un subtítulo en español con una URL limpia y directa
    return {
        subtitles: [
            {
                id: "es_traducido",
                url: "https://raw.githubusercontent.com/wistranslate/Stremio-translator/main/empty.srt",
                lang: "es"
            }
        ]
    };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });

console.log(`Addon corriendo en el puerto ${port}`);
