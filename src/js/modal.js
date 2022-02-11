const buttonClose = document.querySelector(".modal-close");
const modalBackdrop = document.querySelector(".modal-backdrop");
const modal = document.querySelector(".modal");

const closeModalKeyboard = function (e) {
  console.log(e.target);
  if (e.key === "Escape" || e.key === "Enter") {
    hideModal();
  }
};

const hideModal = () => {
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.classList.add("invisible");
  }, 500);

  //se cierra el modal, aquí debería añadirse los listeners input
};

modalBackdrop.addEventListener("click", hideModal);
buttonClose.addEventListener("click", hideModal);
window.addEventListener("keydown", closeModalKeyboard, { once: true });

const infoButton = document.querySelector(".info-button");
infoButton.addEventListener("click", () => {
  window.addEventListener("keydown", closeModalKeyboard, { once: true });
  modal.classList.remove("invisible");
  buttonClose.focus();
  setTimeout(() => {
    modal.style.opacity = "100";
  }, 0);
});
