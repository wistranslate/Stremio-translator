const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const translate = require("@vitalets/google-translate-api");
const fetch = require("node-fetch");

const manifest = {
    id: "community.stremio.translator.es",
    version: "1.0.3",
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
        // 1. Buscamos un subtítulo en inglés de fuentes públicas (ej. OpenSubtitles o similar)
        // Usamos una URL de ejemplo o buscamos el archivo base para este ID
        const subApiUrl = `https://opensubtitles-v2.strem.fun/subtitles/en/${args.id}.json`;
        const response = await fetch(subApiUrl);
        const data = await response.json();

        let srtContent = "";

        if (data && data.subtitles && data.subtitles.length > 0 && data.subtitles[0].url) {
            // Descargamos el contenido del subtítulo original en inglés
            const srtRes = await fetch(data.subtitles[0].url);
            srtContent = await srtRes.text();
        } else {
            // Si no encuentra ninguno, usamos un texto de respaldo simulando subtítulos de la serie
            srtContent = "1\n00:00:01,000 --> 00:00:04,000\nSubtitulos originales en ingles no encontrados, usando traduccion base.";
        }

        // 2. Traducimos todo el contenido al español con la librería
        const res = await translate(srtContent, { to: 'es' });
        const textoTraducido = res.text;

        // 3. Empaquetamos el resultado traducido para Stremio
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
        console.error("Error al procesar la traducción real:", err);
        // Fallback seguro si algo falla
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

console.log(`Addon de traducción real activo en el puerto ${port}`);
