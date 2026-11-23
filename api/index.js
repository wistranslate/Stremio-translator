const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const translate = require("@vitalets/google-translate-api");
const fetch = require("node-fetch");

const manifest = {
    id: "community.stremio.translator.es",
    version: "1.0.7",
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
        // 1. Buscamos el subtítulo en inglés disponible para este identificador de Stremio
        const subApiUrl = `https://opensubtitles-v2.strem.fun/subtitles/en/${args.id}.json`;
        const response = await fetch(subApiUrl);
        const data = await response.json();

        let srtContent = "";

        if (data && data.subtitles && data.subtitles.length > 0 && data.subtitles[0].url) {
            // 2. Descargamos el archivo .srt original en inglés
            const srtRes = await fetch(data.subtitles[0].url);
            srtContent = await srtRes.text();
        } else {
            // Si por lo que sea no encuentra archivo en esa ruta, usamos un texto base de aviso
            srtContent = "1\n00:00:01,000 --> 00:00:05,000\nNo se encontraron subtítulos en inglés para traducir.";
        }

        // 3. Traducimos todo el contenido al español usando Google Translate al vuelo
        const res = await translate(srtContent, { to: 'es' });
        const textoTraducido = res.text;

        // 4. Codificamos el resultado para entregárselo a Stremio
        const base64Sub = Buffer.from(textoTraducido).toString('base64');
        const dataUrl = `data:text/plain;base64,${base64Sub}`;

        return {
            subtitles: [
                {
                    id: "es_traducido_real",
                    url: dataUrl,
                    lang: "es"
                }
            ]
        };
    } catch (err) {
        console.error("Error en la traducción real:", err);
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

console.log(`Addon con traductor real activo en el puerto ${port}`);
