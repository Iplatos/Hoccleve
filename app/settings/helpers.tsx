import { FileData } from '../redux/slises/probeWorkSlice.ts'
import { ImageTaskComponent } from '../components/ImageTaskComponent/ImageTaskComponent.tsx'
import { Text } from 'react-native'
import { AudioComponent } from '../components/AudioComponent/AudioComponent.tsx'
import { User, UserRole } from '../redux/slises/userSlice.ts'

// const renderers = {
//     image: (file: FileData) => <ImageTaskComponent file={file} />,
//     audio: (file: FileData) => <AudioComponent audioFile={file} />,
//     // Добавьте другие типы по необходимости
// };
//
// // export const renderFile = (file: FileData) => {
// //     const renderer = renderers[file.type];
// //     return renderer ? renderer(file) : <Text key={file.id}>Неизвестный тип файла</Text>;
// // };

export const hasRole = (user: User, roleName: UserRole): boolean => {
  return !!user?.roles?.some((role) => role.item_name === roleName)
}

export const renderFile = (file: FileData) => {
  if (file.type === 'image' || file.type === 'key') {
    return <ImageTaskComponent file={file} />
  } else if (file.type === 'audio') {
    return <AudioComponent audioFile={file} />
  } else {
    return (
      <Text
      //  key={file.id}
      >
        Неизвестный тип файла
      </Text>
    )
  }
}

// Функция для преобразования JSON в HTML
export const convertJsonToHtml = (json: string) => {
  try {
    const parsedJson = JSON.parse(json)

    // Проверка на наличие и тип 'content' в parsedJson
    if (!parsedJson.content || !Array.isArray(parsedJson.content)) {
      //  console.warn('Некорректный формат JSON: отсутствует или некорректное свойство content');
      return '<p>Нет подсказки</p>'
    }

    // Создание HTML из контента JSON
    const htmlContent = parsedJson.content
      .map((paragraph: any) => {
        // Проверка на корректность параграфа
        if (
          paragraph.type !== 'paragraph' ||
          !paragraph.content ||
          !Array.isArray(paragraph.content)
        ) {
          return '' // Пропускаем некорректные параграфы
        }

        // Преобразование текста внутри параграфа
        const paragraphHtml = paragraph.content
          .map((text: any) => {
            // Проверка на корректность текста
            if (text.type !== 'text' || typeof text.text !== 'string') {
              return '' // Пропускаем некорректные текстовые элементы
            }

            // Применение стилей к тексту
            const textStyles = (text.marks || [])
              .map((mark: any) => {
                if (mark.type === 'bold') return 'font-weight: bold;'
                if (mark.type === 'textStyle' && mark.attrs && mark.attrs.color) {
                  return `color: ${mark.attrs.color};`
                }
                return ''
              })
              .join(' ')

            return `<span style="${textStyles}">${text.text}</span>`
          })
          .join('')

        return `<p style="margin: 0; padding: 3px;">${paragraphHtml}</p>`
      })
      .join('')

    return htmlContent
  } catch (error) {
    // console.error('Ошибка при разборе JSON:', error);
    return <></>
  }
}
export const getUnionDate = (dates) => {
  const newDates = []
  dates.forEach((date) => {
    date.ids.forEach((id) => {
      const freeDateInNewDate = newDates.find(
        (currentDate) => currentDate.date == date.date && !currentDate.ids.includes(id)
      )
      if (freeDateInNewDate) {
        freeDateInNewDate.ids.push(id)
        freeDateInNewDate.directionsToDates[id] = date.id
        freeDateInNewDate.directionsToTooltip[id] = {
          commentDZ: date.comment_to_dz,
          topic: date.lesson_topic,
        }
      } else {
        newDates.push({
          ...date,
          ids: date.ids.map((el) => el),
          directionsToDates: date.ids.reduce((res, el) => {
            res[el] = date.id
            return res
          }, {}),
          directionsToTooltip: date.ids.reduce((res, el) => {
            res[el] = {
              commentDZ: date.comment_to_dz,
              topic: date.lesson_topic,
            }
            return res
          }, {}),
        })
      }
    })
  })
  return newDates
}
export const removeDuplicates = (dates) => {
  const newDates = []
  dates.forEach((date) => {
    if (!newDates.some((newDate) => newDate.id == date.id)) newDates.push(date)
  })
  return newDates
}
export const getSortByField = (field) => (el1, el2) => {
  if (el1[field] > el2[field]) return 1
  if (el1[field] < el2[field]) return -1
  if (el1[field] == el2[field]) return 0
}

export default getSortByField
