import { $, setVar } from './util.js';
import { pasteCode } from './code.js';
import { takeSnap, cameraFlashAnimation } from './snap.js';

const navbarNode = $('#navbar');
const windowControlsNode = $('#window-controls');
const windowTitleNode = $('#window-title');
const btnSave = $('#save');

let config;
let html;

const getClipboardHtml = (clip) => {
  const html = clip.getData('text/html');
  if (html) return html;
  const text = clip
    .getData('text/plain')
    .split('\n')
    .map((line) => `<div>${line}</div>`)
    .join('');
  return `<div>${text}</div>`;
};

btnSave.addEventListener('click', () => takeSnap(config));

document.addEventListener('copy', () => takeSnap({ ...config, shutterAction: 'copy' }));

document.addEventListener('paste', (e) => {
    html = getClipboardHtml(e.clipboardData);
    pasteCode(config, html);
});

window.addEventListener('message', ({ data: { type, ...cfg } }) => {
  if (type === 'update') {
    config = cfg;

    const {
      fontLigatures,
      tabSize,
      backgroundColor,
      boxShadow,
      containerPadding,
      roundedCorners,
      showWindowControls,
      showWindowTitle,
      windowTitle
    } = config;

    setVar('ligatures', fontLigatures ? 'normal' : 'none');
    if (typeof fontLigatures === 'string') setVar('font-features', fontLigatures);
    setVar('tab-size', tabSize);
    setVar('container-background-color', backgroundColor);
    setVar('box-shadow', boxShadow);
    setVar('container-padding', containerPadding);
    setVar('window-border-radius', roundedCorners ? '4px' : 0);

    navbarNode.hidden = !showWindowControls && !showWindowTitle;
    windowControlsNode.hidden = !showWindowControls;
    windowTitleNode.hidden = !showWindowTitle;

    windowTitleNode.textContent = windowTitle;

    document.execCommand('paste');
  } else if (type === 'flash') {
    cameraFlashAnimation();
  }
});

$("#highlighted-lines").addEventListener("input", () => {
    pasteCode(config, html);
});

$("#highlighted-lines").addEventListener("paste", evt => {
    evt.preventDefault();
});
