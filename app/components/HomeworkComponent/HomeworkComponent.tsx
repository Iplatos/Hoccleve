import React, { useEffect, useState } from 'react'

import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import { formatCreatedAtDate, formatDate } from '../../settings/utils.ts'
import { fetchHomeWork } from '../../redux/slises/homeWorkDetailSlice.ts'
import { ROUTES } from '../../constants/Routes.ts'
import { useNavigation } from '@react-navigation/native'
import { DropdownComponent, statusData } from '../DropdownComponent/DropdownComponent.tsx'
import { fetchWorks, HomeWorkType, WorkType } from '../../redux/slises/workSlice.ts'
import { fetchControlWork } from '../../redux/slises/controlWorkSlice.ts'
import { Colors } from '../../constants/Colors.ts'
import Toast from 'react-native-toast-message'
import { GlobalStyle } from '../../constants/GlobalStyle.ts'
import { CoursesHeader } from '../CoursesHeader/CoursesHeader.tsx'
import { BlocksRenderer } from '../BlocksRenderer/BlocksRenderer.tsx'

type HomeworkComponentProps = {
  id: number
}

export const HomeworkComponent = ({ id }: HomeworkComponentProps) => {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState(statusData[0].value)
  const [homeworkType, setHomeworkType] = useState<WorkType>('homework')
  const [direction, setDirection] = useState('no_direction')
  // const homeworkState = useAppSelector((state) => state.homework);
  const [page, setPage] = useState(1)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { homework, controlwork, classwork } = useAppSelector((state) => state.works)
  const data =
    homeworkType === 'homework'
      ? homework
      : homeworkType === 'controlwork'
      ? controlwork
      : classwork

  const { courses } = useAppSelector((state) => state.studentCourses)

  useEffect(() => {
    setPage(1)
  }, [status, homeworkType, direction])

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingMore(true)
      await dispatch(
        fetchWorks({
          workType: homeworkType,
          id,
          page,
          statusFilter: status,
        })
      )
      setIsFetchingMore(false)
    }

    fetchData()
  }, [id, page, status, homeworkType, direction])

  const handleLoadMore = () => {
    if (!isFetchingMore && data.meta && page < data.meta.pageCount) {
      setIsFetchingMore(true)
      setPage((prevPage) => prevPage + 1)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setPage(1)
    await dispatch(
      fetchWorks({
        workType: homeworkType,
        id,
        page: 1,
        statusFilter: status,
      })
    )
    setIsRefreshing(false)
  }

  if (data.status === 'loading' && !isFetchingMore && !isRefreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  const renderItem: ListRenderItem<HomeWorkType> = ({ item }) => {
    const activeCourse = courses?.filter(
      (el) => el.direction?.name === (item?.direction?.name ?? item?.work?.course?.direction?.name)
    )
    const isDenyAccess = activeCourse.length > 0 && activeCourse[0].deny_access

    switch (homeworkType) {
      case 'homework':
        return <HomeworkItem item={item} isDenyAccess={isDenyAccess} />
      case 'controlwork':
        return <ControlWorkItem item={item} isDenyAccess={isDenyAccess} />
      case 'classwork':
        return <HomeworkItem item={item} isDenyAccess={isDenyAccess} />
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        data={data.works}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            <CoursesHeader title={'Мои задания'} />
            <DropdownComponent
              setStatus={setStatus}
              setHomeworkType={setHomeworkType}
              totalCount={data?.meta?.totalCount ?? 0}
            />
          </>
        }
        persistentScrollbar
        nestedScrollEnabled
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        ListFooterComponent={isFetchingMore ? <ActivityIndicator /> : null}
      />

      {/* Ошибка загрузки */}
      {data.status === 'failed' && <Text>Error: {data.error}</Text>}
    </View>
  )
}

const HomeworkItem = ({ item, isDenyAccess }: { item: HomeWorkType; isDenyAccess: boolean }) => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const titleWork = item.is_unique ? 'Уникальная домашняя работа' : 'Домашняя работа'

  const homeWorks = item?.is_unique ? item?.homeWorkUniqueTasks : item?.lesson?.lessonTasks

  const totalWorks = item?.lesson?.lessonTasks.length
  const completedWorks = item?.homeWorkResults.length
  const completionPercentage = totalWorks ? ((completedWorks / totalWorks) * 100).toFixed(0) : '0'

  const deadlineDate = new Date(item?.deadline_date || '')
  const currentDate = new Date()

  const isOverdue = deadlineDate <= currentDate
  console.log('item', item)

  // Использование
  const getTextFromDescription = (str: string) => {
    try {
      const cleaned = str.replace(/\\"/g, '"').replace(/\\\\/g, '\\')

      const parsed = JSON.parse(cleaned)

      // Извлекаем текст из структуры
      let result = ''
      const extractText = (content: any) => {
        if (Array.isArray(content)) {
          content.forEach((item) => {
            if (item.text) result += item.text
            if (item.content) extractText(item.content)
          })
        }
      }

      if (parsed.content) {
        extractText(parsed.content)
      }

      return result || 'Нет текста'
    } catch (error) {
      console.log('Ошибка парсинга:', error)
      return 'Ошибка загрузки описания'
    }
  }
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{titleWork}</Text>
        <View style={{ alignItems: 'flex-end', marginVertical: 10 }}>
          <View>
            <Text>{completionPercentage}% / 100%</Text>
          </View>
          <View>
            <Text>Кол-во попыток: {item.attempt}</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Направление</Text>
          <View style={styles.valueBlock}>
            <Text style={styles.value}>{item.direction.name}</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Тема</Text>
          <View style={styles.valueBlock}>
            <Text>{getTextFromDescription(item?.direction?.description)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Урок</Text>
          <View style={styles.valueBlock}>
            <Text style={styles.value}>{item.lesson?.name}</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <ScrollView showsHorizontalScrollIndicator={true} horizontal={true}>
          {homeWorks.map((task, index) => {
            const taskResult = item?.homeWorkResults.find(
              (result) => result.task_id === task.task.id
            )
            console.log('taskResult', taskResult)
            const buttonStyle =
              taskResult && taskResult.decided_right === 1
                ? styles.correctButton
                : taskResult && taskResult.decided_right !== 1
                ? styles.incorrectButton
                : styles.button
            return (
              <View key={`${item.id}-${index}`} style={buttonStyle}>
                <Text style={styles.buttonText}>{index + 1}</Text>
              </View>
            )
          })}
        </ScrollView>
      </View>
      {item?.created_at && (
        <View
          style={[
            GlobalStyle.mark,
            {
              backgroundColor: '#f9f9f9',
              borderColor: '#dddce3',
            },
          ]}
        >
          <Text style={{ fontWeight: 'bold' }}>{formatCreatedAtDate(item.created_at)}</Text>
        </View>
      )}
      {item?.deadline_date && (
        <View
          style={[
            GlobalStyle.mark,
            {
              backgroundColor: isOverdue ? Colors.backgroundAccentFirstLight : '#f9f9f9',
              borderColor: isOverdue
                ? Colors.backgroundAccentFirstLight
                : Colors.backgroundAccentFirstLight,
            },
          ]}
        >
          <Text style={{ fontWeight: 'bold' }}>Выполнить до {formatDate(item.deadline_date)}</Text>
        </View>
      )}
      {item?.mark && (
        <View style={GlobalStyle.mark}>
          <Text style={{ fontWeight: 'bold' }}>Оценка: {item?.mark}</Text>
        </View>
      )}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (isDenyAccess) {
              Toast.show({
                type: 'info',
                text1: 'Ошибка',
                text2: 'У Вас не оплачен курс. \n' + 'Свяжитесь с тех. Поддержкой',
                position: 'bottom',
                bottomOffset: 50,
              })
              return
            }
            const homeWorkCompleted = item.status === 0 ? 'notCompleted' : 'completed'
            dispatch(fetchHomeWork(item.id))
            // @ts-ignore
            navigation.navigate(ROUTES.HOME_WORK, { isCompleted: homeWorkCompleted })
          }}
        >
          <Text style={styles.actionButtonText}>Перейти к дз</Text>
        </TouchableOpacity>

        {item.can_redo && (
          <TouchableOpacity
            style={[styles.actionButton, { marginRight: 0 }]}
            onPress={() => {
              dispatch(fetchHomeWork(item.id))
              // @ts-ignore
              navigation.navigate(ROUTES.HOME_WORK, { isCompleted: 'notCompleted' })
            }}
          >
            <Text style={styles.actionButtonText}>Перерешать дз</Text>
          </TouchableOpacity>
        )}

        {/*{item.lesson.redo_homework === 1 ? (*/}
        {/*    <TouchableOpacity*/}
        {/*        style={[styles.actionButton, {marginRight: 0}]}*/}
        {/*        onPress={() => {*/}
        {/*            dispatch(fetchHomeWork(item.id));*/}
        {/*            navigation.navigate(ROUTES.HOME_WORK, {isCompleted: 'notCompleted'});*/}
        {/*        }}*/}
        {/*    >*/}
        {/*        <Text style={styles.actionButtonText}>Перерешать дз</Text>*/}
        {/*    </TouchableOpacity>*/}
        {/*) : (*/}
        {/*    <View style={styles.deadlineContainer}>*/}
        {/*        <Text style={styles.deadlineText}>Выполнить</Text>*/}
        {/*        <Text style={styles.deadlineText}>до {formatDate(item.deadline_date)}</Text>*/}
        {/*    </View>*/}
        {/*)}*/}
      </View>
    </View>
  )
}

const ControlWorkItem = ({ item, isDenyAccess }: { item: HomeWorkType; isDenyAccess: boolean }) => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const totalWorks = item?.work?.material?.controlTasks.length
  const completedWorks = item?.controlWorkResults.length
  const completionPercentage = totalWorks ? ((completedWorks / totalWorks) * 100).toFixed(0) : '0'

  const deadlineDate = new Date(item?.deadline_date || '')
  const currentDate = new Date()

  const isOverdue = deadlineDate <= currentDate
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Контрольная работа</Text>
        <View style={{ alignItems: 'flex-end', marginVertical: 10 }}>
          <View>
            <Text>{completionPercentage}% / 100%</Text>
          </View>
          {/*<View>*/}
          {/*    <Text>Кол-во попыток: {item.attempt}</Text>*/}
          {/*</View>*/}
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Направление</Text>
          <View style={styles.valueBlock}>
            <Text style={styles.value}>{item?.work?.material.course.direction.name}</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Урок</Text>
          <View style={styles.valueBlock}>
            <Text style={styles.value}>{item?.work?.material.name}</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <ScrollView showsHorizontalScrollIndicator={true} horizontal={true}>
          {item?.work?.material?.controlTasks.map((task: any, index: number) => {
            const taskResult = task

            // Определяем стиль кнопки в зависимости от значения decided_right
            const buttonStyle =
              taskResult.decided_right === 1
                ? styles.correctButton
                : taskResult.decided_right === 0
                ? styles.incorrectButton
                : styles.button
            return (
              <View key={`${item.id}-${index}`} style={buttonStyle}>
                <Text style={styles.buttonText}>{index + 1}</Text>
              </View>
            )
          })}
          {/*{item.controlWorkResults.map((task, index) => {*/}
          {/*    const taskResult = task;*/}

          {/*    // Определяем стиль кнопки в зависимости от значения decided_right*/}
          {/*    const buttonStyle =*/}
          {/*        taskResult.decided_right === 1*/}
          {/*            ? styles.correctButton*/}
          {/*            : taskResult.decided_right === 0*/}
          {/*                ? styles.incorrectButton*/}
          {/*                : styles.button;*/}
          {/*    return (*/}
          {/*        <View key={`${item.id}-${index}`} style={buttonStyle}>*/}
          {/*            <Text style={styles.buttonText}>{index + 1}</Text>*/}
          {/*        </View>*/}
          {/*    );*/}
          {/*})}*/}
        </ScrollView>
      </View>
      {item?.created_at && (
        <View
          style={[
            GlobalStyle.mark,
            {
              backgroundColor: '#f9f9f9',
              borderColor: '#dddce3',
            },
          ]}
        >
          <Text style={{ fontWeight: 'bold' }}>{formatCreatedAtDate(item.created_at)}</Text>
        </View>
      )}
      {item?.deadline_date && (
        <View
          style={[
            GlobalStyle.mark,
            {
              backgroundColor: isOverdue ? Colors.backgroundAccentFirstLight : '#f9f9f9',
              borderColor: isOverdue
                ? Colors.backgroundAccentFirstLight
                : Colors.backgroundAccentFirstLight,
            },
          ]}
        >
          <Text style={{ fontWeight: 'bold' }}>Выполнить до {formatDate(item.deadline_date)}</Text>
        </View>
      )}
      {item?.mark && (
        <View style={GlobalStyle.mark}>
          <Text style={{ fontWeight: 'bold' }}>Оценка: {item?.mark}</Text>
        </View>
      )}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (isDenyAccess) {
              Toast.show({
                type: 'info',
                text1: 'Ошибка',
                text2: 'У Вас не оплачен курс. \n' + 'Свяжитесь с тех. Поддержкой',
                position: 'bottom',
                bottomOffset: 50,
              })
              return
            }

            dispatch(fetchControlWork(item.id))
            // @ts-ignore
            navigation.navigate(ROUTES.CONTROL_WORK)
          }}
        >
          <Text style={styles.actionButtonText}>Перейти к контрольной</Text>
        </TouchableOpacity>
        {/*{item.lesson.redo_homework === 1 ? (*/}
        {/*    <TouchableOpacity*/}
        {/*        style={[styles.actionButton, {marginRight: 0}]}*/}

        {/*    >*/}
        {/*        <Text style={styles.actionButtonText}>Перерешать дз</Text>*/}
        {/*    </TouchableOpacity>*/}
        {/*) : (*/}
        {/*    <View style={styles.deadlineContainer}>*/}
        {/*        <Text style={styles.deadlineText}>Выполнить</Text>*/}
        {/*        <Text style={styles.deadlineText}>до {formatDate(item.deadline_date)}</Text>*/}
        {/*    </View>*/}
        {/*)}*/}
      </View>
    </View>
  )
}

const ClassWorkItem = ({ item }: { item: any }) => {
  console.log('ClassWorkItem', item)
  return (
    <View style={styles.card}>
      {/* Render class work details here */}
      {/*<Text>Class Work: {item.lesson.name}</Text>*/}
      {/*<TouchableOpacity style={styles.actionButton}>*/}
      {/*    <Text style={styles.actionButtonText}>Перейти к классной работе</Text>*/}
      {/*</TouchableOpacity>*/}
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Добавляем легкий фон
  },
  card: {
    backgroundColor: '#f7f9fc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
    gap: 5,
  },
  infoContainer: {
    flex: 1,
    // alignSelf: 'center'
  },
  label: {
    fontSize: 13,
    paddingLeft: 10,
    color: Colors.colorBlack,
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  valueBlock: {
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#dddce3',
    borderRadius: 8,
    paddingLeft: 5,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#4CAF50', // Зеленый цвет для правильных ответов
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  incorrectButton: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#e74c3c', // Красный цвет для неправильных ответов
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f1c40f',
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    //  marginRight: 10,
  },
  actionButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deadlineContainer: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    //  marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  deadlineText: {
    color: '#555',
  },

  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  homeworkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  homeworkInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lessonName: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    color: 'red',
    marginLeft: 10,
  },
})
