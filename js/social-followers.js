(function () {
    const followerSources = {
        youtube: {
            enabled: true,
            channelHandle: '@konekt4',
            mirrorUrl: 'https://r.jina.ai/http://www.youtube.com/'
        },
        tiktok: {
            enabled: true,
            username: 'konekt4',
            mirrorUrl: 'https://r.jina.ai/http://socialblade.com/tiktok/user/'
        },
        instagram: {
            enabled: false,
            username: 'pendiente'
        },
        twitch: {
            enabled: false,
            username: 'pendiente'
        },
        facebook: {
            enabled: false,
            page: 'pendiente'
        }
    };

    function normalizeCount(raw) {
        return String(raw || '').replace(/\s+/g, ' ').trim();
    }

    async function fetchYoutubeFollowers(config) {
        const url = `${config.mirrorUrl}${config.channelHandle}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('No se pudo consultar YouTube.');
        }

        const html = await response.text();
        const match = html.match(/([0-9][0-9\.,]*\s*[KMB]?)\s+subscribers?/i)
            || html.match(/([0-9][0-9\.,]*\s*[KMB]?)\s+suscriptores?/i);

        if (!match || !match[1]) {
            throw new Error('No se encontro el contador de suscriptores de YouTube.');
        }

        return normalizeCount(match[1]);
    }

    async function fetchTiktokFollowers() {
        const url = `${followerSources.tiktok.mirrorUrl}${followerSources.tiktok.username}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('No se pudo consultar TikTok.');
        }

        const html = await response.text();
        const match = html.match(/Followers\s+([0-9][0-9\.,]*\s*[KMB]?)/i);

        if (!match || !match[1]) {
            throw new Error('No se encontro el contador de seguidores de TikTok.');
        }

        return normalizeCount(match[1]);
    }

    async function fetchInstagramFollowers() {
        throw new Error('Plantilla Instagram pendiente.');
    }

    async function fetchTwitchFollowers() {
        throw new Error('Plantilla Twitch pendiente.');
    }

    async function fetchFacebookFollowers() {
        throw new Error('Plantilla Facebook pendiente.');
    }

    async function runFollowersTest() {
        console.info('[followers] Iniciando prueba de fuentes...');

        const handlers = {
            youtube: fetchYoutubeFollowers,
            tiktok: fetchTiktokFollowers,
            instagram: fetchInstagramFollowers,
            twitch: fetchTwitchFollowers,
            facebook: fetchFacebookFollowers
        };

        const entries = Object.entries(followerSources);

        for (const [network, config] of entries) {
            if (!config.enabled) {
                console.info(`[followers] ${network}: plantilla configurada (pendiente de implementar).`);
                continue;
            }

            const handler = handlers[network];

            if (!handler) {
                console.warn(`[followers] ${network}: sin manejador definido.`);
                continue;
            }

            try {
                const count = await handler(config);
                console.log(`[followers] ${network}: ${count}`);

                if (network === 'youtube') {
                    const youtubeBtn = document.querySelector('.btn.youtube');
                    if (youtubeBtn) {
                        youtubeBtn.setAttribute('data-followers', `Suscriptores\n${count}`);
                    }
                }
            } catch (error) {
                const message = error && error.message ? error.message : 'Error desconocido.';
                console.error(`[followers] ${network}: ${message}`);

                if (network === 'youtube') {
                    const youtubeBtn = document.querySelector('.btn.youtube');
                    if (youtubeBtn) {
                        youtubeBtn.setAttribute('data-followers', 'Suscriptores\n--');
                    }
                }
            }
        }
    }

    runFollowersTest();
})();