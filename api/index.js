const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const translate = require("@vitalets/google-translate-api");
const fetch = require("node-fetch");

const manifest = {
    id: "community.stremio.translator.es",
    version: "1.0.2",
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

    try {
        // 1. Aquí es donde buscamos o descargamos el subtítulo original en inglés
        // (Por ahora, para asegurar que no falle, simulamos el texto o cogemos una base)
        const textoOriginal = "1\n00:00:01,000 --> 00:00:04,000\nHello, welcome to the show.";

        // 2. Traducimos el texto al español automáticamente con Google Translate
        const res = await translate(textoOriginal, { to: 'es' });
        const textoTraducido = res.text;

        // Como Stremio necesita una URL o un formato de datos válido, 
        // convertimos el texto traducido en un data URI o lo servimos correctamente.
        // Una forma muy limpia para que Stremio lo lea sin errores de servidor externo:
        const base64Sub = Buffer.from(textoTraducido).toString('base64');
        const dataUrl = `data:text/plain;base64,${base64Sub}`;

        return {
            subtitles: [
                {
                    id: "es_traducido_dinamico",
                    url: dataUrl,
                    lang: "es"
                }
            ]
        };
    } catch (err) {
        console.error("Error en la traducción:", err);
        // Si algo falla, devolvemos el de respaldo para que no se raye el reproductor
        return {
            subtitles: [
                {
                    id: "es_fallback",
                    url: "https://raw.githubusercontent.com/wistranslate/Stremio-translator/main/empty.srt",
                    lang: "es"
                }
            ]
        };
    }
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });

console.log(`Addon con traductor activo en el puerto ${port}`);
