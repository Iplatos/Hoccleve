const fs = require('fs')
const path = require('path')

console.log('🔧 Setting up Google Services...')

if (process.env.GOOGLE_SERVICES_ANDROID) {
  console.log('✅ Found GOOGLE_SERVICES_ANDROID environment variable')

  try {
    // Декодируем base64
    const fileContents = Buffer.from(process.env.GOOGLE_SERVICES_ANDROID, 'base64').toString('utf8')

    // Путь для сохранения
    const filePath = path.join(__dirname, '..', 'android', 'app', 'google-services.json')

    // Создаем папки если нужно
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log('📁 Created android/app directory')
    }

    // Сохраняем файл
    fs.writeFileSync(filePath, fileContents)
    console.log('✅ Google Services JSON created successfully!')
  } catch (error) {
    console.error('❌ Error creating Google Services file:', error)
    process.exit(1)
  }
} else {
  console.log('⚠️ GOOGLE_SERVICES_ANDROID variable not found')
}
