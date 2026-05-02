(function () {
    const panelStack = document.querySelector('.panel-stack');
    const mainPanel = document.querySelector('.main-panel');
    const backPanel = document.querySelector('.back-panel');
    const panelStackHint = document.querySelector('.panel-stack-hint');

    if (!panelStack || !mainPanel || !backPanel) {
        return;
    }

    function setActivePanel(isSecondaryActive) {
        panelStack.classList.toggle('is-secondary-active', isSecondaryActive);
    }

    function showSecondaryPanel() {
        setActivePanel(true);
    }

    function showPrimaryPanel() {
        setActivePanel(false);
    }

    function togglePanelFocus() {
        const isSecondaryActive = panelStack.classList.contains('is-secondary-active');
        setActivePanel(!isSecondaryActive);
    }

    function handleHintClick(event) {
        event.stopPropagation();
        togglePanelFocus();
    }

    function syncClickablePanel() {
        backPanel.removeEventListener('click', showSecondaryPanel);
        mainPanel.removeEventListener('click', showPrimaryPanel);

        if (panelStack.classList.contains('is-secondary-active')) {
            mainPanel.addEventListener('click', showPrimaryPanel);
        } else {
            backPanel.addEventListener('click', showSecondaryPanel);
        }
    }

    syncClickablePanel();

    if (panelStackHint) {
        panelStackHint.addEventListener('click', handleHintClick);
    }

    const observer = new MutationObserver(syncClickablePanel);
    observer.observe(panelStack, { attributes: true, attributeFilter: ['class'] });
})();