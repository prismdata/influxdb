import appReducer from 'src/shared/reducers/app'
import {
  enablePresentationMode,
  disablePresentationMode,
  setTheme,
  setAutoRefresh,
} from 'src/shared/actions/app'
import {TimeZone} from 'src/types'
import {AppState as AppPresentationState} from 'src/shared/reducers/app'

describe('Shared.Reducers.appReducer', () => {
  const initialState: AppPresentationState = {
    ephemeral: {
      inPresentationMode: false,
    },
    persisted: {
      autoRefresh: 0,
      showTemplateControlBar: false,
      timeZone: 'Local' as TimeZone,
      theme: 'dark',
    },
  }

  it('should handle ENABLE_PRESENTATION_MODE', () => {
    const reducedState = appReducer(initialState, enablePresentationMode())

    expect(reducedState.ephemeral.inPresentationMode).toBe(true)
  })

  it('should handle DISABLE_PRESENTATION_MODE', () => {
    Object.assign(initialState, {ephemeral: {inPresentationMode: true}})

    const reducedState = appReducer(initialState, disablePresentationMode())

    expect(reducedState.ephemeral.inPresentationMode).toBe(false)
  })

  it('should handle SET_THEME with light theme', () => {
    const reducedState = appReducer(initialState, setTheme('light'))

    expect(reducedState.persisted.theme).toBe('light')
  })

  it('should handle SET_THEME with dark theme', () => {
    Object.assign(initialState, {persisted: {theme: 'light'}})

    const reducedState = appReducer(initialState, setTheme('dark'))

    expect(reducedState.persisted.theme).toBe('dark')
  })

  it('should handle SET_AUTOREFRESH', () => {
    const expectedMs = 15000

    const reducedState = appReducer(initialState, setAutoRefresh(expectedMs))

    expect(reducedState.persisted.autoRefresh).toBe(expectedMs)
  })
})
