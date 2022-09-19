import { $, $$, setVar, calcTextWidth } from './util.js';

const snippetNode = $('#snippet');

//
// Recursively remove colors from a tree of nodes.
//
const removeColors = el => {
  if (el.style) {
    el.style.color = null;
  }

  if (el.childNodes) {
    for (const child of Array.from(el.childNodes)) {
      removeColors(child);
    }
  }
}

//
// Determine which lines of code are highlighted, if any.
//
const computeHighlightedLines = () => {
  const highlightedRowsInput = $("#highlighted-lines"); 
  const highlightedRows = highlightedRowsInput.value.trim()
    .split(",")
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(part => part.split("-").map(segment => parseInt(segment.trim())));
  const haveHighlights = highlightedRows.length > 0;
  const highlightsMap = {};
  for (const highlightedRow of highlightedRows) {
    if (highlightedRow.length === 1) {
        highlightsMap[highlightedRow[0]] = true;
    }
    else {
        for (let rowIndex = highlightedRow[0]; rowIndex <= highlightedRow[1]; ++rowIndex) {
            highlightsMap[rowIndex] = true;
        }
    }
  }
  
  return { haveHighlights, highlightsMap };
}

const setupLines = (node, config) => {

  const { haveHighlights, highlightsMap } = computeHighlightedLines();

  $$(':scope > br', node).forEach((row) => (row.outerHTML = '<div>&nbsp;</div>'));

  const rows = $$(':scope > div', node);
  setVar('line-number-width', calcTextWidth(rows.length + config.startLine));

  rows.forEach((row, idx) => {

    const lineNumber = idx + 1 + config.startLine;

    if (haveHighlights) {
      if (!highlightsMap[lineNumber]) {
        // Remove colors from rows that aren't highlighted.
        removeColors(row);
      }
    }
    
    const newRow = document.createElement('div');
    newRow.classList.add('line');
    row.replaceWith(newRow);

    if (config.showLineNumbers) {
      const lineNum = document.createElement('div');
      lineNum.classList.add('line-number');
      lineNum.textContent = lineNumber;
      newRow.appendChild(lineNum);
    }

    const span = document.createElement('span');
    span.textContent = ' ';
    row.appendChild(span);

    const lineCodeDiv = document.createElement('div');
    lineCodeDiv.classList.add('line-code');
    const lineCode = document.createElement('span');
    lineCode.innerHTML = row.innerHTML;
    lineCodeDiv.appendChild(lineCode);

    newRow.appendChild(lineCodeDiv);
  });
};

const stripInitialIndent = (node) => {
  const regIndent = /^\s+/u;
  const initialSpans = $$(':scope > div > span:first-child', node);
  if (initialSpans.some((span) => !regIndent.test(span.textContent))) return;
  const minIndent = Math.min(
    ...initialSpans.map((span) => span.textContent.match(regIndent)[0].length)
  );
  initialSpans.forEach((span) => (span.textContent = span.textContent.slice(minIndent)));
};

export const pasteCode = (config, html) => {
  snippetNode.innerHTML = html;
  const code = $('div', snippetNode);
  snippetNode.style.fontSize = code.style.fontSize;
  snippetNode.style.lineHeight = code.style.lineHeight;
  snippetNode.innerHTML = code.innerHTML;
  stripInitialIndent(snippetNode);
  setupLines(snippetNode, config);
};
