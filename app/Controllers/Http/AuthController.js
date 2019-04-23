'use strict'

const User = use('App/Models/User');

class AuthController {

  async accountCheck({request, auth, response}){
    try {
      let account = await auth.getUser();
      response.status(200).json({"id": account.id, "username": account.username });
    } catch (error) {
      response.send({message: "Untuk membuka halaman ini silahkan masuk"})
    }
  }

  async register({request, auth, response}) {
    const userData = request.only(['username', 'email', 'password'])
    try {
      const user = await User.create(userData);
      const accessToken = await auth.withRefreshToken().generate(user)
      return response.json({"username":user.username, "access_token": accessToken})  
    } catch (error) {
      console.log(error);
      return response.status(401).send({error})
    }
  }

  async login({request, auth, response}) {
    const email = request.input("email")
    const password = request.input("password");
    try {
      if (await auth.attempt(email, password)) {
        let user = await User.findBy('email', email)
        let accessToken = await auth.withRefreshToken().generate(user)
        return response.json({"user":user, "access_token": accessToken})
      }

    } catch (error) {
      return response.status(401).send({message: 'Email / Password Salah'})
    }
  }

  async logout({request, auth, response}) {
    const ApiToken = auth.getAuthHeader()
    await auth
      .authenticator('jwt')
      .revokeTokens([ApiToken])
    return response.send({ message: 'Revoke Token successfully!'})
  }

}

module.exports = AuthController
