import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'

import { Colors } from '../../constants/Colors.ts'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import {
  setBlockID,
  setCourseID,
  setGroupID,
  setType,
  StudentCourse,
} from '../../redux/slises/studentCoursesSlice.ts'
import { fetchDirectionPlan } from '../../redux/slises/directionPlanSlice.ts'
import { useAppDispatch } from '../../redux/hooks.ts'
import { ROUTES } from '../../constants/Routes.ts'
import { compareToday, formateDate } from '../../settings/utils.ts'
import Toast from 'react-native-toast-message'
import { fetchBlockThemes } from '../../redux/slises/blockThemesSlice.ts'

interface CourseCardProps {
  course: StudentCourse
  url: string | null
  isDisplayFullNameSeminarian: boolean
  isFreeCourses: boolean
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  url,
  isDisplayFullNameSeminarian,
  isFreeCourses,
}) => {
  console.log('course', course)
  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(false)

  const progress = Math.round(
    (Number(course.topicFinishedCount ?? 0) / Number(course.topicTotalCount ?? 1)) * 100
  )

  const date = new Date(course?.order?.next_payment_date)
  const privateType = !course?.order?.buy_months
  const freeType = !(course?.order?.buy_hours || course?.order?.buy_months)

  const handlePress = async () => {
    if (course?.deny_access) {
      Toast.show({
        type: 'info',
        text1: 'Ошибка',
        text2: 'У Вас не оплачен курс. \nСвяжитесь с тех. поддержкой',
        position: 'bottom',
        bottomOffset: 50,
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await dispatch(
        fetchDirectionPlan({
          groupId: course.group?.id,
          course_id: course.direction.id,
        })
      ).unwrap()

      console.log('response', response)

      if (response.status !== 'success') {
        throw new Error('Не удалось загрузить курс')
      }

      const directions = response.data?.data || []
      dispatch(setGroupID(course.group?.id ? course.group?.id : course.direction.id))
      dispatch(setType(course.group?.id ? 'group' : 'private'))
      dispatch(setCourseID(course.direction.id))

      if (directions.length === 1) {
        const blockId = Number(directions[0].id)
        dispatch(setBlockID(blockId))

        const result = await dispatch(
          fetchBlockThemes({
            groupId: course.group?.id ?? undefined,
            blockId,
            type: course.group?.id ? 'group' : 'private',
          })
        )

        if (fetchBlockThemes.fulfilled.match(result)) {
          // @ts-ignore
          // navigation.navigate(ROUTES.BLOCK_THEMES, {
          //     groupId: course.group?.id,
          //     blockId,
          //     type: course.group?.id ? 'group' : 'private'
          // });
          return
        } else {
          throw new Error('Неизвестная ошибка при загрузке тем')
        }
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error)
      Toast.show({
        type: 'error',
        text1: 'Ошибка!',
        text2: 'Не удалось загрузить курс или темы',
        position: 'bottom',
        bottomOffset: 50,
      })
    } finally {
      setIsLoading(false)
    }

    // Если fetchBlockThemes не был вызван, выполняем стандартную навигацию
    // @ts-ignore
    navigation.navigate(ROUTES.COURSE_DETAIL)
  }

  return (
    <>
      {course.order.status_payment === 1 && (
        <TouchableOpacity disabled={isLoading} onPress={handlePress} style={{ flex: 1 }}>
          <LinearGradient colors={['#fff', '#f3efef', '#f0f9ff', '#e9f6ff']} style={styles.card}>
            {isLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator />
              </View>
            )}

            <View style={styles.header}>
              <Text style={styles.title}>{course.direction?.name}</Text>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M8.59 16.34L13.17 12 8.59 7.66L10 6.25L16 12.25L10 18.25L8.59 16.34Z"
                  fill="#2B2D3E"
                />
              </Svg>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Тема {course.topicFinishedCount} из {course.topicTotalCount}
              </Text>
            </View>

            <View style={{ justifyContent: 'center' }}>
              <View style={styles.progressBarContainer}>
                <View style={{ ...styles.progressBar, width: `${progress}%` }} />
              </View>
              <Image source={{ uri: `${url}${course.direction.icon_path}` }} style={styles.image} />
            </View>

            <Text style={styles.time}>
              {isFreeCourses &&
                (freeType
                  ? 'бесплатный'
                  : privateType
                  ? `оплачено ${course?.order?.buy_hours} ч`
                  : `${compareToday(date) > 0 ? 'не оплачено с' : 'оплачено до'} ${formateDate(
                      date,
                      'DD.MM.YYYY'
                    )}`)}
            </Text>

            {isDisplayFullNameSeminarian && (
              <Text style={{ fontSize: 16 }}>
                Преподаватель: {course?.direction?.seminarian_name}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: Colors.background,
    gap: 15,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B2D3E',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#2B2D3E',
  },
  totalText: {
    fontSize: 16,
    color: '#2B2D3E',
    marginLeft: 5,
  },
  progressBarContainer: {
    width: '80%',
    height: 5,
    backgroundColor: '#d0e0ff',
    borderRadius: 5,
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.yellow,
    borderRadius: 5,
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    position: 'absolute',
    right: 0,
    //   bottom: 0,
    zIndex: 50,
  },
  time: {
    color: '#8b95a5',
  },
})
