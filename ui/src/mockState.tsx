import React from 'react'
import {Provider} from 'react-redux'
import {Router, createMemoryHistory} from 'react-router'

import {render} from 'react-testing-library'
import {initialState as initialVariablesState} from 'src/variables/reducers'
import {initialState as initialUserSettingsState} from 'src/userSettings/reducers'
import configureStore from 'src/store/configureStore'
import {RemoteDataState, TimeZone, LocalStorage, ResourceType} from 'src/types'
import {pastFifteenMinTimeRange} from './shared/constants/timeRanges'

const {Orgs} = ResourceType
const {Done} = RemoteDataState

export const localState: LocalStorage = {
  app: {
    ephemeral: {
      inPresentationMode: false,
    },
    persisted: {
      autoRefresh: 0,
      showTemplateControlBar: false,
      timeZone: 'Local' as TimeZone,
      theme: 'dark',
    },
  },
  VERSION: '2.0.0',
  ranges: {
    '0349ecda531ea000': pastFifteenMinTimeRange,
  },
  autoRefresh: {},
  userSettings: initialUserSettingsState(),
  resources: {
    [Orgs]: {
      byID: {
        orgid: {
          name: 'org',
          id: 'orgid',
        },
      },
      allIDs: ['orgid'],
      org: {name: 'org', id: 'orgid'},
      status: Done,
    },
    variables: initialVariablesState(),
  },
}

const history = createMemoryHistory({entries: ['/']})

export function renderWithRedux(ui, initialState = s => s) {
  const seedStore = configureStore(localState, history)
  const seedState = seedStore.getState()
  const store = configureStore(initialState(seedState), history)

  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  }
}

export function renderWithReduxAndRouter(
  ui,
  initialState = s => s,
  {route = '/', history = createMemoryHistory({entries: [route]})} = {}
) {
  const seedStore = configureStore(localState, history)
  const seedState = seedStore.getState()
  const store = configureStore(initialState(seedState), history)

  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>{ui}</Router>
      </Provider>
    ),
    store,
  }
}

export function renderWithRouter(
  ui,
  {route = '/', history = createMemoryHistory({entries: [route]})} = {}
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    history,
  }
}
