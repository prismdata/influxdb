import {combineReducers} from 'redux'

// Types
import {ActionTypes, Action} from 'src/shared/actions/app'
import {AUTOREFRESH_DEFAULT_INTERVAL} from 'src/shared/constants'
import {TimeZone} from 'src/types'

export interface AppState {
  ephemeral: {
    inPresentationMode: boolean
  }
  persisted: {
    autoRefresh: number
    showTemplateControlBar: boolean
    timeZone: TimeZone
    theme: 'dark' | 'light'
  }
}

const initialState: AppState = {
  ephemeral: {
    inPresentationMode: false,
  },
  persisted: {
    theme: 'dark',
    autoRefresh: AUTOREFRESH_DEFAULT_INTERVAL,
    showTemplateControlBar: false,
    timeZone: 'Local',
  },
}

const {
  ephemeral: initialAppEphemeralState,
  persisted: initialAppPersistedState,
} = initialState

const appEphemeralReducer = (
  state = initialAppEphemeralState,
  action: Action
): AppState['ephemeral'] => {
  switch (action.type) {
    case ActionTypes.EnablePresentationMode: {
      return {
        ...state,
        inPresentationMode: true,
      }
    }

    case ActionTypes.DisablePresentationMode: {
      return {
        ...state,
        inPresentationMode: false,
      }
    }

    default:
      return state
  }
}

const appPersistedReducer = (
  state = initialAppPersistedState,
  action: Action
): AppState['persisted'] => {
  switch (action.type) {
    case 'SET_THEME': {
      return {...state, theme: action.theme}
    }

    case ActionTypes.SetAutoRefresh: {
      return {
        ...state,
        autoRefresh: action.payload.milliseconds,
      }
    }

    case ActionTypes.SetTimeZone: {
      const {timeZone} = action.payload

      return {...state, timeZone}
    }

    default:
      return state
  }
}

const appReducer = combineReducers<AppState>({
  ephemeral: appEphemeralReducer,
  persisted: appPersistedReducer,
})

export default appReducer
