export const authService = {
  login(password: string) {
    return window.api.login(password)
  },

  changePassword(oldPassword: string, newPassword: string) {
    return window.api.changePassword(oldPassword, newPassword)
  }
}
