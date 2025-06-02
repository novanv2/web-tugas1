class loginPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async handleLogin(email, password) {
    try {
      const response = await this.model.login(email, password);
      const { token, userId, name } = response.loginResult;

      this.model.saveLoginData({ token, userId, name });

      this.view.showMessage('Login berhasil..!', true);
      this.view.redirectToHome();
    } catch (error) {
      this.view.showMessage(`Login gagal: ${error.message}`, false);
    }
  }
}

export default loginPresenter;
