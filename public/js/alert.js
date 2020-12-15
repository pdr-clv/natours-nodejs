/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  //TRICK we go one element parent from (el), and then we remove child, this is the way to remove alert.
  if (el) el.parentElement.removeChild(el);
}

export const showAlert = (type, msg) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};