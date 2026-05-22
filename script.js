const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const buttons = document.querySelectorAll('.btn');
buttons.forEach((button) => {
  button.addEventListener('mouseenter', () => {
    button.style.filter = 'brightness(1.05)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.filter = 'brightness(1)';
  });
});
