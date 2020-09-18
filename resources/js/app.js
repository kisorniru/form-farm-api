import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { NotificationContainer } from 'react-notifications'
import { setAuthUser } from './state/actions'
import store from './state/store'
import Routing from './router'
import * as Sentry from '@sentry/browser'

const app = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    await store.dispatch(setAuthUser(token))
  }

  // Sentry.init({
  //   dsn: process.env.MIX_SENTRY_DSN_PUBLIC,
  //   environment: process.env.MIX_SENTRY_ENVIRONMENT,
  // })

  if (document.getElementById('app')) {
    render(
      <Provider store={store}>
        <Routing />
        <NotificationContainer />
      </Provider>,
      document.getElementById('app')
    )
  }
}

app()
