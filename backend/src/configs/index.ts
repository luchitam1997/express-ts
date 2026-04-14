export const initConfigs = async () => {
  try {
    console.log('All configurations initialized successfully')
  } catch (error) {
    console.error('Error initializing configurations:', error)
    throw error
  }
}
