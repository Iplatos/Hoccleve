import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useAppSelector } from '../../redux/hooks.ts'
import { now, todayDate } from '../../settings/Settings.ts'
import Toast from 'react-native-toast-message'
import { transformToAgendaItems } from '../ExpandableCalendarScreen/ExpandableCalendarScreen.tsx'

export const TodayLessonButton = () => {
  const timetable = useAppSelector((state) => state.calendar.data)
  const [loading, setLoading] = useState(false)

  const agendaItems = useMemo(() => transformToAgendaItems(timetable), [timetable])

  const allLessons = useMemo(() => {
    return agendaItems
      .flatMap((day) => day.data)
      .filter((item) => item.date_conference === todayDate && !item.is_cancel)
  }, [agendaItems])

  //   console.log(allLessons)

  const upcomingLesson = useMemo(() => {
    return allLessons
      .filter((item) => {
        const [hours, minutes] = item.end_time.split(':').map(Number)
        const endDate = new Date()
        endDate.setHours(hours, minutes, 0, 0)
        return endDate > now // урок ещё не закончился
      })
      .sort((a, b) => {
        const [aH, aM] = a.start_time.split(':').map(Number)
        const [bH, bM] = b.start_time.split(':').map(Number)
        const aDate = new Date()
        const bDate = new Date()
        aDate.setHours(aH, aM, 0, 0)
        bDate.setHours(bH, bM, 0, 0)
        return aDate.getTime() - bDate.getTime()
      })[0]
  }, [allLessons])

  if (!upcomingLesson) return null

  const handlePress = async (link: string) => {
    setLoading(true)
    try {
      if (upcomingLesson.deny_access) {
        Toast.show({
          type: 'info',
          text1: 'Нет доступа',
          text2: 'У Вас не оплачен курс. \n' + 'Свяжитесь с тех. Поддержкой',
          position: 'bottom',
          bottomOffset: 50,
        })
        return
      }
      if (link) {
        await Linking.openURL(link)
      } else {
        Alert.alert('Ссылка не найдена', 'Ссылка отсутствует')
      }
    } catch (err) {
      Alert.alert('Ошибка', `Не удалось открыть ссылку: ${link}`)
    } finally {
      setLoading(false)
    }
  }
  console.log(upcomingLesson)

  return (
    <TouchableOpacity
      disabled={loading}
      onPress={() => handlePress(upcomingLesson.link_to_meeting)}
      style={styles.button}
    >
      {loading ? (
        <ActivityIndicator size="small" style={{ marginRight: 5 }} />
      ) : (
        <Text style={styles.icon}>🎓</Text>
      )}
      <View
        style={{
          width: '100%',
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text style={styles.title}>{upcomingLesson.directionName || upcomingLesson.name}</Text>
          <Text style={styles.time}>Сегодня в {upcomingLesson.start_time.slice(0, 5)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 13,
              marginLeft: 8,
              textDecorationStyle: 'solid',
              textDecorationColor: 'black',
              textDecorationLine: 'underline',
            }}
          >
            Перейти
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f8f0ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',

    // alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  title: {
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
})

// <TouchableOpacity
//     disabled={loading}
//     onPress={() => handlePress(upcomingLesson.link_to_meeting)}
//     style={styles.button}>
//     {loading ? (
//         <ActivityIndicator size="small" style={{marginRight: 5}}/>
//     ) : (
//         <Text style={styles.icon}>🎓</Text>
//     )}
//     <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
//         <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
//             <Text
//                 style={styles.title}
//                 numberOfLines={1}
//                 ellipsizeMode="tail"
//             >
//                 {upcomingLesson.direction?.name || upcomingLesson.name}
//             </Text>
//             <Text style={styles.time}>
//                 Сегодня в {upcomingLesson.start_time.slice(0, 5)}
//             </Text>
//         </View>
//         <View style={{flex: 1, width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
//             {/*<Text style={{fontSize: 20, marginLeft: 8}}>→</Text>*/}
//             <Text style={{fontSize: 20, marginLeft: 8}}>→</Text>
//         </View>
//     </View>
// </TouchableOpacity>
