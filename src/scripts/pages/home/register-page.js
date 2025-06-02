import registerPresenter from '../../presenters/register-presenter.js';
import authModel from '../../models/auth-model.js';

const registerPage = {
  async render() {
    return `
      <section id="form">
        <h2>Register</h2>
        <form id="registerForm">
          <div>
            <label for="name">Nama:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Register</button>
        </form>
        <p id="registerMessage"></p>
      </section>
    `;
  },

  async afterRender() {
    const model = new authModel('https://story-api.dicoding.dev/v1');
    const presenter = new registerPresenter(model, this);

    const form = document.getElementById('registerForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      presenter.handleRegister(name, email, password);
    });
  },

  showMessage(message, isSuccess) {
    const messageElement = document.getElementById('registerMessage');
    messageElement.style.color = isSuccess ? 'green' : 'red';
    messageElement.textContent = message;
  },

  redirectToLogin(delay = 1500) {
    setTimeout(() => {
      window.location.hash = '#/login';
    }, delay);
  }
};

export default registerPage;
