import loginPresenter from '../../presenters/login-presenter.js';
import authModel from '../../models/auth-model.js';

const loginPage = {
  async render() {
    return `
      <section id="form">
        <h2>Login</h2>
        <form id="loginForm">
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Login</button>
        </form>
        <p id="loginMessage"></p>
      </section>
    `;
  },

  async afterRender() {
    const model = new authModel('https://story-api.dicoding.dev/v1');
    const presenter = new loginPresenter(model, this);

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      presenter.handleLogin(email, password);
    });
  },

  showMessage(message, isSuccess) {
    const messageElement = document.getElementById('loginMessage');
    messageElement.style.color = isSuccess ? 'green' : 'red';
    messageElement.textContent = message;
  },

  redirectToHome() {
    window.location.hash = '/';
  }
};

export default loginPage;