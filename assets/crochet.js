document.querySelectorAll(".flip").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("active");
  });
});
