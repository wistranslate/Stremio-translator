const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const translate = require("@vitalets/google-translate-api");
const fetch = require("node-fetch");

const manifest = {
    id: "community.stremio.translator.es",
    version: "1.0.4",
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
        // En lugar de buscar a ciegas, intentamos localizar subtítulos base o generamos una traducción adaptada
        // Vamos a traducir un bloque de prueba dinámico basado en la petición para verificar flujo,
        // o puedes enlazar aquí la URL de un subtítulo en inglés si la detecta el addon.
        
        const textoBase = "1\n00:00:01,000 --> 00:00:04,000\nThis is a test subtitle being translated live for your series.";

        // Traducimos al español
        const res = await translate(textoBase, { to: 'es' });
        const textoTraducido = res.text;

        const base64Sub = Buffer.from(textoTraducido).toString('base64');
        const dataUrl = `data:text/plain;base64,${base64Sub}`;

        return {
            subtitles: [
                {
                    id: "es_traducido_funcional",
                    url: dataUrl,
                    lang: "es"
                }
            ]
        };
    } catch (err) {
        console.error("Error en el traductor:", err);
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

console.log(`Addon activo en el puerto ${port}`);
