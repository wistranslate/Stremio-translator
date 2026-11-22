const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const translate = require("@vitalets/google-translate-api"); // Traductor rápido y gratuito
const fetch = require("node-fetch"); // O fetch nativo de Node

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
    console.log("Petición de subtítulos recibida para:", args.type, args.id);

    try {
        // 1. Aquí puedes conectar con una fuente o buscar subtítulos en inglés si faltan,
        // o procesar los subtítulos que lleguen. 
        // Como ejemplo base funcional, devolvemos una estructura limpia lista para traducir.
        
        const subtitles = [
            {
                id: "translated_sub_1",
                url: "https://opensubtitles-v2.strem.fun/subtitles/en/tt1234567.json", // Ejemplo de origen
                lang: "es",
                subtitles: [] 
            }
        ];

        return { subtitles };
    } catch (err) {
        console.error("Error al traducir subtítulos:", err);
        return { subtitles: [] };
    }
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });

console.log(`Addon con traductor activo en el puerto ${port}`);
