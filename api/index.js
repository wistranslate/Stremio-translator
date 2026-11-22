const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");
const translate = require("@iamtraction/google-translate");

const manifest = {
    id: "org.ramon.autospanishsubs",
    version: "1.0.0",
    name: "Auto Subtítulos Español (IA)",
    description: "Busca subtítulos en español y si no existen, traduce automáticamente del inglés con Google Translate.",
    resources: ["subtitles"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);
const cacheSubtitulos = {};

async function traducirSRT(srtTexto) {
    const bloques = srtTexto.split(/\r?\n\r?\n/);
    const bloquesTraducidos = [];

    for (let i = 0; i < bloques.length; i += 25) {
        const lote = bloques.slice(i, i + 25);
        const textosParaTraducir = [];
        const estructuras = [];

        lote.forEach(bloque => {
            const lineas = bloque.split(/\r?\n/);
            if (lineas.length >= 3) {
                const indice = lineas[0];
                const tiempo = lineas[1];
                const texto = lineas.slice(2).join(" ");
                estructuras.push({ indice, tiempo });
                textosParaTraducir.push(texto);
            }
        });

        if (textosParaTraducir.length > 0) {
            try {
                const combinado = textosParaTraducir.join(" ||| ");
                const res = await translate(combinado, { from: "en", to: "es" });
                const traducciones = res.text.split(" ||| ");

                estructuras.forEach((est, idx) => {
                    const lineaTraducida = traducciones[idx] || textosParaTraducir[idx];
                    bloquesTraducidos.push(`${est.indice}\n${est.tiempo}\n${lineaTraducida}`);
                });
            } catch (error) {
                estructuras.forEach((est, idx) => {
                    bloquesTraducidos.push(`${est.indice}\n${est.tiempo}\n${textosParaTraducir[idx]}`);
                });
            }
        }
    }

    return bloquesTraducidos.join("\n\n");
}

builder.defineSubtitlesHandler(async ({ type, id }) => {
    if (cacheSubtitulos[id]) {
        return { subtitles: [{ id: "auto-es-cached", url: cacheSubtitulos[id], lang: "spa" }] };
    }

    try {
        const osUrl = `https://opensubtitles-v3.strem.io/subtitles/${type}/${id}.json`;
        const response = await fetch(osUrl);
        const data = await response.json();

        if (!data || !data.subtitles || data.subtitles.length === 0) {
            return { subtitles: [] };
        }

        const subEspanol = data.subtitles.find(s => s.lang === "spa" || s.lang === "es");
        if (subEspanol) {
            return {
                subtitles: [{
                    id: "direct-es",
                    url: subEspanol.url,
                    lang: "spa"
                }]
            };
        }

        const subIngles = data.subtitles.find(s => s.lang === "eng" || s.lang === "en");
        if (subIngles) {
            const srtResponse = await fetch(subIngles.url);
            const srtOriginal = await srtResponse.text();

            const srtTraducido = await traducirSRT(srtOriginal);

            const base64Srt = Buffer.from(srtTraducido, "utf-8").toString("base64");
            const dataUri = `data:application/x-subrip;charset=utf-8;base64,${base64Srt}`;

            cacheSubtitulos[id] = dataUri;

            return {
                subtitles: [{
                    id: "auto-translated-es",
                    url: dataUri,
                    lang: "spa"
                }]
            };
        }
    } catch (err) {
        console.error("Error procesando subtítulos:", err);
    }

    return { subtitles: [] };
});

module.exports = builder.getInterface();
