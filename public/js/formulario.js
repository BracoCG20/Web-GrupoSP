document.addEventListener('DOMContentLoaded', () => {
  initContactForms();
});
function initContactForms() {
  const forms = document.querySelectorAll('.contact-form');
  if (forms.length === 0) return;
  const sanitizeInput = (str) => {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  };
  const createStatusElement = (form) => {
    let p = form.querySelector('.form-status-msg');
    if (!p) {
      p = document.createElement('p');
      p.className = 'form-status-msg';
      p.style.fontSize = '1rem';
      p.style.marginTop = '15px';
      p.style.display = 'none';
      p.style.fontWeight = '500';
      const btnWrapper =
        form.querySelector('.contact-form__btn-wrapper') ||
        form.lastElementChild;
      form.insertBefore(p, btnWrapper);
    }
    return p;
  };
  const mostrarError = (input, mensaje) => {
    const parent = input.parentElement;
    let error = parent.querySelector('.error-msg');

    if (!error) {
      error = document.createElement('span');
      error.className = 'error-msg';
      error.style.color = '#fff';
      error.style.backgroundColor = '#ff6b6b';
      error.style.textAlign = 'center';
      error.style.padding = '10px';
      error.style.fontSize = '0.7rem';
      error.style.display = 'block';
      error.style.marginTop = '5px';
      parent.appendChild(error);
    }
    error.textContent = mensaje;
    input.style.borderBottom = '1px solid #ff6b6b';
  };
  const eliminarError = (input) => {
    const parent = input.parentElement;
    const error = parent.querySelector('.error-msg');
    if (error) {
      error.remove();
    }
    input.style.borderBottom = '';
  };
  const validarInput = (input, lang) => {
    const valor = input.value.trim();
    const name = input.name;
    const txt = {
      required:
        lang === 'en'
          ? 'This field is required.'
          : 'Este campo es obligatorio.',
      nameInvalid:
        lang === 'en'
          ? 'Only letters and spaces allowed.'
          : 'El nombre solo puede contener letras y espacios.',
      emailInvalid:
        lang === 'en'
          ? 'Please enter a valid email.'
          : 'Ingresa un correo electrónico válido.',
    };
    if (valor === '' && name !== '_gotcha') {
      mostrarError(input, txt.required);
      return false;
    }
    if ((name === 'nombre' || name === 'name') && valor !== '') {
      const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
      if (!nombreRegex.test(valor)) {
        mostrarError(input, txt.nameInvalid);
        return false;
      }
    }
    if ((name === 'correo' || name === 'email') && valor !== '') {
      const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!correoRegex.test(valor)) {
        mostrarError(input, txt.emailInvalid);
        return false;
      }
    }
    eliminarError(input);
    return true;
  };
  forms.forEach((form) => {
    const inputs = form.querySelectorAll(
      'input:not([type="hidden"]), textarea'
    );

    inputs.forEach((input) => {
      input.addEventListener('blur', () => {
        const isEnglish =
          document.documentElement.lang === 'en' ||
          window.location.href.includes('/en/');
        validarInput(input, isEnglish ? 'en' : 'es');
      });
      input.addEventListener('input', () => eliminarError(input));
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const isEnglish =
        document.documentElement.lang === 'en' ||
        window.location.href.includes('/en/');
      const honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        console.warn('Bot detectado.');
        return;
      }
      let formularioValido = true;
      inputs.forEach((input) => {
        if (!validarInput(input, isEnglish ? 'en' : 'es')) {
          formularioValido = false;
        }
      });
      if (!formularioValido) return;
      const status = createStatusElement(form);
      const btn = form.querySelector('button[type="submit"]');
      const originalBtnText = btn.innerText;
      const msgs = {
        loading: isEnglish ? 'Sending...' : 'Enviando...',
        success: isEnglish
          ? 'Message sent successfully!'
          : '¡Mensaje enviado con éxito!',
        error: isEnglish
          ? 'Oops! There was a problem.'
          : 'Uy! Hubo un error al enviar.',
      };
      btn.disabled = true;
      btn.innerText = msgs.loading;
      status.style.display = 'none';
      const formData = new FormData(form);
      const dataObject = {};

      formData.forEach((value, key) => {
        if (key !== '_gotcha') {
          dataObject[key] = sanitizeInput(value);
        }
      });
      try {
        const response = await fetch('/enviar-correo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(dataObject),
        });
        const result = await response.json();
        if (response.ok) {
          status.innerText = msgs.success;
          status.style.color = '#fff';
          status.style.backgroundColor = '#4caf50';
          status.style.textAlign = 'center';
          status.style.padding = '10px';
          status.style.display = 'block';
          form.reset();
        } else {
          throw new Error(result.error || 'Error desconocido');
        }
      } catch (error) {
        console.error(error);
        status.innerText = msgs.error;
        status.style.color = '#f44336';
        status.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.innerText = originalBtnText;
        setTimeout(() => {
          status.style.display = 'none';
        }, 5000);
      }
    });
  });
}
