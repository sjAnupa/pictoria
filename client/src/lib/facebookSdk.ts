const FACEBOOK_SDK_ID = 'facebook-jssdk'

export function loadFacebookSdk(appId: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Facebook SDK requires a browser environment'))
  }

  if (window.FB) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(FACEBOOK_SDK_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      return
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v21.0',
      })
      resolve()
    }

    const script = document.createElement('script')
    script.id = FACEBOOK_SDK_ID
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'))
    document.body.appendChild(script)
  })
}
