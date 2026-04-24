(function () {
    const statusEl = document.getElementById('youtube-status');
    const channelId = 'UCosNVo3F769-BqIX9UcJb0A';
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const daysToConsiderNew = 5;
    const fallbackVideoPage = 'https://www.youtube.com/@konekt4/videos';

    if (!statusEl) {
        return;
    }

    function getVideoIdFromLink(link) {
        if (!link) {
            return '';
        }

        const watchMatch = link.match(/[?&]v=([A-Za-z0-9_-]{11})/);
        if (watchMatch) {
            return watchMatch[1];
        }

        const shortMatch = link.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
        if (shortMatch) {
            return shortMatch[1];
        }

        return '';
    }

    function getThumbnailUrl(item) {
        if (item && item.thumbnail) {
            return item.thumbnail;
        }

        const videoId = getVideoIdFromLink(item && item.link ? item.link : '');
        return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function isLikelyShort(item) {
        const title = item && item.title ? item.title : '';
        const description = item && item.description ? item.description : '';
        const categories = item && item.categories ? item.categories.join(' ') : '';
        const link = item && item.link ? item.link : '';
        const searchable = `${title} ${description} ${categories} ${link}`.toLowerCase();

        return /#shorts|\bshorts\b|\/shorts\//.test(searchable);
    }

    function isTaggedStream(item) {
        const title = item && item.title ? item.title.toLowerCase() : '';
        return /#tennocreate|\btennocreate\b/.test(title);
    }

    fetch(apiUrl)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('No se pudo leer el feed de YouTube.');
            }
            return response.json();
        })
        .then(function (data) {
            if (!data.items || !data.items.length) {
                throw new Error('No hay videos en el feed.');
            }

            const latestVideo = data.items.find(function (item) {
                return !isLikelyShort(item) && !isTaggedStream(item);
            });

            if (!latestVideo) {
                throw new Error('No se encontro un video largo fuera de Shorts y directos etiquetados.');
            }

            const pubDate = new Date(latestVideo.pubDate);
            const now = new Date();
            const diffInDays = Math.floor((now - pubDate) / (1000 * 60 * 60 * 24));
            const isNew = diffInDays <= daysToConsiderNew;
            const safeTitle = escapeHtml(latestVideo.title || 'Video sin titulo');
            const videoLink = latestVideo.link || fallbackVideoPage;
            const thumbnailUrl = getThumbnailUrl(latestVideo);
            const safeThumb = escapeHtml(thumbnailUrl);

            statusEl.classList.remove('loading');
            statusEl.classList.add(isNew ? 'is-new' : 'is-old');
            statusEl.href = videoLink;

            const videoDate = isNaN(pubDate.getTime())
                ? '--'
                : pubDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

            const statusLabel = isNew ? 'Nuevo' : 'Ultimo';
            const thumbHtml = safeThumb
                ? `<span class="youtube-status-thumb"><img src="${safeThumb}" alt="Miniatura del video" loading="lazy"></span>`
                : '';

            statusEl.innerHTML =
                `<span class="youtube-status-meta">${statusLabel}<br>${videoDate}</span>` +
                `<span class="youtube-status-title" title="${safeTitle}">${safeTitle}</span>` +
                thumbHtml;
        })
        .catch(function () {
            statusEl.classList.remove('loading');
            statusEl.classList.add('error');
            statusEl.href = fallbackVideoPage;
            statusEl.innerHTML =
                '<span class="youtube-status-meta">Error<br>--</span>' +
                '<span class="youtube-status-title">No disponible</span>';
        });
})();
