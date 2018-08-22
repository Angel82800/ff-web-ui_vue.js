const config = {
  domain: 'factoryfix.auth0.com',
  callbackUrl: `${location.protocol}//${location.hostname}${((location.port && location.port !== '80') ? ':' + location.port : '')}/auth0/callback`
}

switch (location.hostname) {
  case 'gigs.factoryfix.com':
    config.clientId = 'EkNAyNTYHzagczgY7JLE0jvVK9Rh4WTb'
    config.apiUrl = 'https://ff-app-prod.appspot.com'
    break
  case '2fers-dev.factoryfix.com':
  default:
    config.clientId = 'Wh1m3q0saBRyeNHaX2c7H0kemIloWrVW'
    config.apiUrl = 'https://ff-app-dev.appspot.com'
    break
}

export const AUTH_CONFIG = config
