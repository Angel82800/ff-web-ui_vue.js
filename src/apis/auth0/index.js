import auth0 from 'auth0-js'
import { AUTH_CONFIG } from './auth0-variables'

const ID_TOKEN_GROUPS_IDX = AUTH_CONFIG.apiUrl + '/claims/groups' // this needs to be an environment variable

const webAuthDefault = new auth0.WebAuth({
  domain: AUTH_CONFIG.domain,
  clientID: AUTH_CONFIG.clientId,
  redirectUri: AUTH_CONFIG.callbackUrl,
  audience: AUTH_CONFIG.apiUrl,
  responseType: 'token id_token',
  scope: 'openid profile email'
})

const login = function () {
  webAuthDefault.authorize({
    scope: 'openid roles permissions groups',
    mode: 'login',
    audience: AUTH_CONFIG.apiUrl
    // TODO: add state so user can be in the company or expert workflow before signing up. See 'state' https://auth0.com/docs/libraries/auth0js/v9
  })
}

const signup = function (stateVal) {
  let webAuth = webAuthDefault
  if (stateVal) {
    webAuth = new auth0.WebAuth({
      domain: AUTH_CONFIG.domain,
      clientID: AUTH_CONFIG.clientId,
      redirectUri: AUTH_CONFIG.callbackUrl + '?state=' + stateVal,
      audience: AUTH_CONFIG.apiUrl,
      responseType: 'token id_token',
      scope: 'openid profile email'
    })
  }
  webAuth.authorize({
    scope: 'openid roles permissions groups',
    mode: 'signUp',
    audience: AUTH_CONFIG.apiUrl
    // TODO: add state so user can be in the company or expert workflow before signing up. See 'state' https://auth0.com/docs/libraries/auth0js/v9 -- see if we can do it without adding it to the callback url
  })
}

export default {
  ID_TOKEN_GROUPS_IDX,
  login,
  signup,
  webAuthDefault
}
