(function () {
    const panelStack = document.querySelector('.panel-stack');
    const mainPanel = document.querySelector('.main-panel');
    const backPanel = document.querySelector('.back-panel');
    const panelStackHint = document.querySelector('.panel-stack-hint');

    if (!panelStack || !mainPanel || !backPanel) {
        return;
    }

    function getOtherPage() {
        const path = window.location.pathname || '';
        const pageName = path.substring(path.lastIndexOf('/') + 1).toLowerCase();

        if (pageName === 'index.html') return 'konekt5.html';
        if (pageName === 'konekt5.html') return 'index.html';
        if (pageName === 'konekt4.html') return 'konekt5.html';
        return 'konekt5.html';
    }

    function navigateToOtherPage(event) {
        if (event) {
            const clickedLink = event.target && event.target.closest('a');
            if (clickedLink) {
                return;
            }
            event.stopPropagation();
        }

        window.location.href = getOtherPage();
    }

    const isSecondaryActive = panelStack.classList.contains('is-secondary-active');
    const secondaryPanel = isSecondaryActive ? mainPanel : backPanel;
    secondaryPanel.addEventListener('click', navigateToOtherPage);

    if (panelStackHint) {
        panelStackHint.addEventListener('click', navigateToOtherPage);
    }
})();