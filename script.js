/* Smooth Scroll */
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({
      behavior: "smooth"
    });
  });
});

/* Meeresspiegel Modell */
const seaSlider = document.getElementById("seaSlider");
const seaValue = document.getElementById("seaValue");
const floodLayer = document.getElementById("floodLayer");
const impactText = document.getElementById("impactText");

seaSlider.addEventListener("input", () => {
  const level = seaSlider.value / 100;
  seaValue.textContent = level.toFixed(1);

  floodLayer.style.height = `${level * 40}%`;

  if (level < 0.5) {
    impactText.textContent =
      "Geringe Auswirkungen – Küstenschutz ist noch möglich.";
  } else if (level < 1) {
    impactText.textContent =
      "Regelmäßige Überflutungen bedrohen erste Stadtteile.";
  } else if (level < 1.5) {
    impactText.textContent =
      "Große Teile von Küstenstädten sind dauerhaft gefährdet.";
  } else {
    impactText.textContent =
      "Millionen Menschen verlieren ihre Heimat – Klimaflucht nimmt stark zu.";
  }
});
