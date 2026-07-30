document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (detail.open) detail.setAttribute('data-revealed', 'true');
  });
});
