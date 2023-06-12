interface WxConfig {
  envVersion: 'release' | 'trial' | 'develop'
}

declare let __wxConfig : WxConfig
