import { MainPage } from '@pages/main-page'

import { PopupsProvider } from './providers/popups-provider'

export const App = () => {
  return (
    <PopupsProvider>
      <MainPage />
    </PopupsProvider>
  )
}
