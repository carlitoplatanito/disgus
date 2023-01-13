let init = false;

window.addEventListener('DOMContentLoaded', () => {
    if (!init) {
        const disgusContainer = document.getElementById('disgus');
        const disgusFrame = document.createElement('iframe');

        disgusFrame.src="./index.html";
        disgusFrame.width='100%';
        disgusFrame.style.border = 0;
        disgusFrame.style.margin = 0;
        disgusFrame.style.padding = 0;

        disgusFrame.id='disgusFrame';
        disgusFrame.addEventListener('load', () => {
            disgusFrame.height = disgusFrame.contentWindow.document.body.scrollHeight + 20;
            setTimeout(() => {
                disgusFrame.height = disgusFrame.contentWindow.document.body.scrollHeight + 20;
            }, 1000);
        });

        disgusContainer.appendChild(disgusFrame);

        window.addEventListener('resize', () => {
            disgusFrame.height = disgusFrame.contentWindow.document.body.scrollHeight + 20;
        });

        init = true;
    }
});