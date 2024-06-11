chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith('chrome://')) {
    return; // Can't inject script into a special chrome:// page
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: enableElementSelection,
    }
  );
});

function enableElementSelection() {
  if (window.elementSelectionActive) {
    window.dispatchEvent(new Event('disableelementselection'));
    return; // Avoid multiple event listeners
  }

  window.elementSelectionActive = true;

  let lastElement;
  let lastElementStyle;
  let removedElements = [];

  function highlightElement(event) {
    if (lastElement) {
      lastElement.style.cssText = lastElementStyle;
    }
    lastElement = event.target;
    lastElementStyle = lastElement.style.cssText;
    lastElement.style.outline = '2px dashed rgb(255, 0, 138)';
    lastElement.style.outlineOffset = '-2px';
    lastElement.style.backgroundColor = 'rgba(255, 0, 138, 0.1)';
  }

  function removeElement(event) {
    event.preventDefault();
    event.stopPropagation();
    let element = event.target;
    let elementData = {
      element: element,
      parent: element.parentNode,
      nextSibling: element.nextSibling
    };
    removedElements.push(elementData);
    element.remove();
  }

  function undoRemoveElement() {
    if (removedElements.length > 0) {
      let lastRemoved = removedElements.pop();
      lastRemoved.parent.insertBefore(lastRemoved.element, lastRemoved.nextSibling);
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      disableElementSelection();
    } else if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
      undoRemoveElement();
    }
  }

  function handleBeforeUnload() {
    disableElementSelection();
  }

  function disableElementSelection() {
    document.removeEventListener('mouseover', highlightElement);
    document.removeEventListener('click', removeElement);
    document.removeEventListener('keydown', handleKeydown);

    if (lastElement) {
      lastElement.style.cssText = lastElementStyle;
    }

    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('disableelementselection', disableElementSelection);

    window.elementSelectionActive = false;
  }

  document.addEventListener('mouseover', highlightElement);
  document.addEventListener('click', removeElement);
  document.addEventListener('keydown', handleKeydown);

  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('disableelementselection', disableElementSelection);
}
