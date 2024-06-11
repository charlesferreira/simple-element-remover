document.getElementById('remove-element').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: enableElementSelection,
      }
    );
  });
});

function enableElementSelection() {
  let lastElement;

  function highlightElement(event) {
    if (lastElement) {
      lastElement.style.outline = '';
      lastElement.style.backgroundColor = '';
    }
    event.target.style.outline = '2px solid red';
    event.target.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    lastElement = event.target;
  }

  function removeElement(event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.remove();
    document.removeEventListener('mouseover', highlightElement);
    document.removeEventListener('click', removeElement);
  }

  document.addEventListener('mouseover', highlightElement);
  document.addEventListener('click', removeElement, { once: true, capture: true });
}
