import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAppDispatch, useAppSelector } from '../redux/hooks.ts'
import { Colors } from '../constants/Colors.ts'
import { useNavigation, useRoute } from '@react-navigation/native'
import { LessonVideoPlayer } from '../components/LessonVideoPlayer/LessonVideoPlayer.tsx'
import { LessonMaterials } from '../components/LessonMaterials/LessonMaterials.tsx'
import { ScormFile } from '../components/ScormFile/ScormFile.tsx'
import { HomeworkDefaultComponent } from '../components/HomeworkDefaultComponent/HomeworkDefaultComponent.tsx'
import axios from 'axios'
import { resetResult, sendAnswer, SendAnswerPayload } from '../redux/slises/answerSlice.ts'
import { Path, Svg } from 'react-native-svg'
import { GlobalStyle } from '../constants/GlobalStyle.ts'
import Toast from 'react-native-toast-message'
import { toastConfig } from '../settings/ToastHelper.tsx'
import { passWork } from '../redux/slises/passWorkSlice.ts'
import { ROUTES } from '../constants/Routes.ts'
import { fetchHomeWork, LessonTasksType, Task } from '../redux/slises/homeWorkDetailSlice.ts'
import { fetchLessonData } from '../redux/slises/lessonSlice.ts'
import { ViewOrderAndDetailAnswerHomeWork } from '../components/TestComponents/ViewHomeWork/ViewOrderAndDetailAnswerHomeWork.tsx'
import { ViewFileAnswerHomeWork } from '../components/TestComponents/ViewHomeWork/ViewFileAnswerHomeWork.tsx'
import { ViewMatchAnswerHomeWork } from '../components/TestComponents/ViewHomeWork/ViewMatchAnswerHomeWork.tsx'
import { ViewPassWordsAnswerHomeWork } from '../components/TestComponents/ViewHomeWork/ViewPassWordsAnswerHomeWork.tsx'
import { ViewTestAnswerHomeWork } from '../components/TestComponents/ViewHomeWork/ViewTestAnswerHomeWork.tsx'
import { NTestComponent } from '../components/TestComponents/NTestComponent.tsx'
import { reportsOwnBacklog } from '../redux/slises/reportsSlice.ts'
import { NOrderComponent } from '../components/TestComponents/NOrderComponent.tsx'
import { NDetailAnswerComponent } from '../components/TestComponents/NDetailAnswerComponent.tsx'
import { NPassWordsComponent } from '../components/TestComponents/NPassWordsComponent.tsx'
import { NExactAnswerComponent } from '../components/TestComponents/NExactAnswerComponent.tsx'
import { NFileAnswerComponent } from '../components/TestComponents/NFileAnswerComponent.tsx'
import { NMultipleChoiceComponent } from '../components/TestComponents/NMultipleChoiceComponent.tsx'
import { NMatchComponent } from '../components/TestComponents/NMatchComponent.tsx'
import WebView from 'react-native-webview'
import { getUrl } from '../settings/utils.ts'
import { CoursesHeader } from '../components/CoursesHeader/CoursesHeader.tsx'
import { fetchDirectionPlan } from '../redux/slises/directionPlanSlice.ts'
import { fetchThemeLessons, LessonType } from '../redux/slises/themeLessonsSlice.ts'
import { fetchControlWork } from '../redux/slises/controlWorkSlice.ts'
import { Type } from '../redux/slises/studentCoursesSlice.ts'
import { BlocksRenderer } from '../components/BlocksRenderer/BlocksRenderer.tsx'
import { BasketSortTask } from '../components/TestComponents/BasketSortTask.tsx'
import { fetchHomeworkTimer } from '../redux/slises/homeworkTimerSlice.ts'
import { ViewBasketAnswerHomeWork } from '../components/TestComponents/ViewHomeWork/ViewBasketAnswerHomeWork.tsx'

export const taskComponents = {
  test: NTestComponent,
  'pass-words': NPassWordsComponent,
  match: NMatchComponent,
  'detail-answer': NDetailAnswerComponent,
  'file-answer': NFileAnswerComponent,
  order: NOrderComponent,
  'multiple-choice': NMultipleChoiceComponent,
  'exact-answer': NExactAnswerComponent,
  basket: BasketSortTask,
}

export const renderTaskComponent = (task: Task, index: number, taskProps: any) => {
  // @ts-ignore
  const TaskComponent = taskComponents[task.type]
  return TaskComponent ? (
    <TaskComponent task={task} index={index} {...taskProps} />
  ) : (
    <Text>Неизвестный тип задания {task.type}</Text>
  )
}

export const HomeworkScreen = ({ route }: any) => {
  //  const route = useRoute();
  //  const {groupID, type, blockID, course_id} = useAppSelector(state => state.studentCourses);

  const lessonData = useAppSelector((state) => state.lesson)

  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  const { isCompleted } = route.params || {}

  const [url, setUrlState] = useState<string | null>(null)

  const { loading: isPassWorkLoading } = useAppSelector((state) => state.passWork)
  const { homeWork, loading, error } = useAppSelector((state) => state.homeworkDetail)
  const { result } = useAppSelector((state) => state.answerPost)

  const [isCompletedStatus, setIsCompletedStatus] = useState(isCompleted ?? 'default')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // console.log('homeWork', homeWork)

  useEffect(() => {
    dispatch(resetResult())
  }, [homeWork])

  useEffect(() => {
    const fetchUrl = async () => {
      const value = await getUrl()
      setUrlState(value)
    }
    fetchUrl()
  }, [])

  useEffect(() => {
    // Обновляем состояние при изменении параметров
    setIsCompletedStatus(isCompleted ?? 'default')
  }, [isCompleted])

  const isUniqueWork = homeWork?.is_unique === 1

  const completedOnlineTasks = homeWork?.lesson?.lessonTasks?.filter((task) => {
    // Получаем ключи объекта result
    const resultKeys = Object.keys(result)
    // Проверяем, есть ли task.id среди ключей объекта result
    return resultKeys.includes(task.task.id.toString())
  })

  const completedOnlineUniqueTasks = homeWork?.homeWorkUniqueTasks?.filter((task) => {
    // Получаем ключи объекта result
    const resultKeys = Object.keys(result)
    // Проверяем, есть ли task.id среди ключей объекта result
    return resultKeys.includes(task.task.id.toString())
  })

  const isCompletedHomeWork = isUniqueWork
    ? homeWork?.homeWorkResults?.length === homeWork?.homeWorkUniqueTasks?.length
    : homeWork?.homeWorkResults?.length === homeWork?.lesson?.lessonTasks?.length

  const isCompletedUniqueTasksOnline =
    homeWork?.homeWorkResults &&
    completedOnlineUniqueTasks &&
    homeWork?.homeWorkResults?.length + completedOnlineUniqueTasks?.length ===
      homeWork?.homeWorkUniqueTasks?.length

  const isCompletedHomeWorkOnline =
    homeWork?.homeWorkResults &&
    completedOnlineTasks &&
    homeWork?.homeWorkResults?.length + completedOnlineTasks?.length ===
      homeWork?.lesson?.lessonTasks?.length

  const isPrivate = homeWork?.type.includes('private')
  const type: Type = homeWork?.type.includes('private') ? 'private' : 'group'

  // console.log('result', result)
  // console.log('isUniqueWork', isUniqueWork)
  // console.log('homeWorkResults', homeWork?.homeWorkResults?.length)
  // console.log('homeWorkUniqueTasks', homeWork?.homeWorkUniqueTasks.length)
  // console.log('completedOnlineUniqueTasks', completedOnlineUniqueTasks)
  const checkAllTasksCompleted = () => {
    if (homeWork?.only_content === 1) return true

    let totalTasks = 0
    let completedTasks = 0

    if (isUniqueWork) {
      // Для уникальных работ
      totalTasks = homeWork?.homeWorkUniqueTasks?.length || 0
      completedTasks =
        (homeWork?.homeWorkResults?.length || 0) + (completedOnlineUniqueTasks?.length || 0)
    } else {
      // Для обычных работ
      totalTasks = homeWork?.lesson?.lessonTasks?.length || 0
      completedTasks =
        (homeWork?.homeWorkResults?.length || 0) + (completedOnlineTasks?.length || 0)
    }

    console.log(`📊 Проверка заданий: ${completedTasks}/${totalTasks}`)

    return completedTasks === totalTasks && totalTasks > 0
  }

  const handleSubmitWork = async () => {
    if (!homeWork?.id) {
      return Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'ID домашней работы не найден',
        position: 'bottom',
        bottomOffset: 50,
      })
    }

    // 🔥 ДЕТАЛЬНАЯ ОТЛАДКА
    console.log('🔍 ДЕТАЛЬНАЯ ПРОВЕРКА handleSubmitWork:')

    const allTasksCompleted = checkAllTasksCompleted()
    const onlyContent = homeWork?.only_content === 1

    console.log('only_content === 1:', onlyContent)
    console.log('allTasksCompleted:', allTasksCompleted)
    console.log('Условие сдачи:', onlyContent || allTasksCompleted)

    if (onlyContent) {
      console.log('✅ Сдаем: работа только из контента')
      await submitWork()
    } else if (allTasksCompleted) {
      console.log('✅ Сдаем: все задания выполнены')
      await submitWork()
    } else {
      console.log('❌ Не сдаем: не все задания выполнены')
      Toast.show({
        type: 'error',
        text1: 'Упс... Еще остались задания...',
        text2: 'Ответь на все задания и сдай работу',
        position: 'bottom',
        bottomOffset: 50,
      })
    }
  }

  // Вынесем общую логику в отдельную функцию
  const submitWork = async () => {
    try {
      await dispatch(passWork({ id: homeWork.id })).unwrap()

      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Успешно',
          text2: 'Вы успешно сдали работу',
          position: 'bottom',
          bottomOffset: 50,
        })
      }, 1000)

      await dispatch(reportsOwnBacklog())

      // Навигация
      if (route.params.groupId) {
        dispatch(fetchHomeWork(route.params.homeWorkId || homeWork?.id))
        dispatch(
          fetchLessonData({
            groupId: route.params.groupId || homeWork.group_id,
            lessonId: route.params.lessonId,
            type,
          })
        )

        navigation.navigate(ROUTES.LESSON, {
          params: {
            title: route.params.name,
            groupId: route.params.groupId,
            course_id: route.params.course_id,
            direction_id: route.params.direction_id,
            material_id: route.params.material_id,
            lessonId: route.params.lessonId,
          },
        })
      } else {
        navigation.navigate(ROUTES.HOME_WORK)
      }
    } catch (error: any) {
      const allErrors = error?.error?.[0]
        ? Object.values(error.error[0]).flat().join('\n')
        : 'Произошла ошибка при отправке работы'

      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: allErrors,
        position: 'bottom',
        bottomOffset: 50,
      })
    }
  }

  const renderItem = ({ item, index }: { item: LessonTasksType; index: number }) => {
    switch (isCompletedStatus) {
      case 'completed':
        return <ViewHomeWork task={item} index={index + 1} />
      case 'notCompleted':
        return <IncompleteHomeWork task={item} index={index + 1} />
      default:
        return null // Возвращаем null для значения по умолчанию
    }
  }

  const handleLoadComplete = (numberOfPages: any) => {
    setTotalPages(numberOfPages)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  const openLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        Alert.alert('Ошибка', `Не удалось открыть ссылку. Адрес ссылки: ${url}`)
      )
    }
  }

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 100}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <>
        {isCompletedStatus === 'default' ? (
          <View style={{ flex: 1, padding: 10, backgroundColor: Colors.colorWhite }}>
            <HomeworkDefaultComponent />
          </View>
        ) : (
          <ScrollView style={{ flex: 1, padding: 10, backgroundColor: Colors.colorWhite }}>
            <View style={styles.headerBlock}>
              <CoursesHeader title={'Домашняя работа'} />
              {/*<TouchableOpacity style={styles.btn} onPress={() => {*/}
              {/*    navigation.navigate(ROUTES.HOME_WORK)*/}
              {/*    //  setIsCompletedStatus('default')*/}
              {/*}}>*/}
              {/*    <Svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12"*/}
              {/*         fill="none">*/}
              {/*        <Path fillRule="evenodd" clipRule="evenodd"*/}
              {/*              d="M0.21967 6.53033C-0.0732233 6.23744 -0.0732233 5.76256 0.21967 5.46967L5.21967 0.46967C5.51256 0.176777 5.98744 0.176777 6.28033 0.46967C6.57322 0.762563 6.57322 1.23744 6.28033 1.53033L1.81066 6L6.28033 10.4697C6.57322 10.7626 6.57322 11.2374 6.28033 11.5303C5.98744 11.8232 5.51256 11.8232 5.21967 11.5303L0.21967 6.53033Z"*/}
              {/*              fill="#2B2D3E">*/}

              {/*        </Path>*/}
              {/*    </Svg>*/}
              {/*    <Text>Назад</Text>*/}
              {/*</TouchableOpacity>*/}
              {/*<Text style={[GlobalStyle.titleGL, {marginBottom: 0, flex: 1}]}>Домашняя работа</Text>*/}
            </View>
            <BlocksRenderer blocksData={homeWork?.lesson?.blocks!} />

            {/*<LessonVideoPlayer*/}
            {/*    videos={homeWork?.lesson?.lessonVideos}*/}
            {/*    lessonName={homeWork?.lesson?.name}*/}
            {/*/>*/}
            {/*<VideoRatingComponent videoId={homeWork?.lesson?.id}/>*/}

            {/* Полезные материалы */}

            {/*<View style={{marginBottom: 20}}>*/}
            {/*    {(homeWork?.lesson && homeWork?.lesson?.lessonMaterials?.length > 0) && (*/}
            {/*        <>*/}
            {/*            <Text style={styles.materialsTitle}>Полезные материалы:</Text>*/}
            {/*            <LessonMaterials materials={homeWork?.lesson.lessonMaterials}/>*/}
            {/*        </>)}*/}

            {/*    {homeWork?.lesson?.lessonFileMedia && (*/}
            {/*        <View style={{flex: 1}}>*/}

            {/*            <WebView*/}
            {/*                originWhitelist={['*']}*/}
            {/*                source={{uri: `${axios.defaults.baseURL}/${homeWork.lesson.lessonFileMedia.path}`}}*/}
            {/*                style={{width: '100%', height: 240}}*/}
            {/*                onLoadEnd={() => handleLoadComplete(totalPages)} // Передайте общее количество страниц*/}
            {/*            />*/}
            {/*            <TouchableOpacity*/}
            {/*                onPress={() => openLink(`${axios.defaults.baseURL}/${homeWork?.lesson?.lessonFileMedia?.path}`)}*/}
            {/*                style={GlobalStyle.btnOpenFile}>*/}
            {/*                <Text>*/}
            {/*                    Открыть файл PDF*/}
            {/*                </Text>*/}
            {/*            </TouchableOpacity>*/}
            {/*        </View>*/}
            {/*    )}*/}

            {/*    {homeWork?.lesson.lesson_file && (*/}
            {/*        <View style={{flex: 1, marginTop: 15}}>*/}

            {/*            <WebView*/}
            {/*                originWhitelist={['*']}*/}
            {/*                source={{uri: `${url}/${homeWork.lesson.lesson_file}`}}*/}
            {/*                style={{width: '100%', height: 240}}*/}
            {/*                onLoadEnd={() => handleLoadComplete(totalPages)} // Передайте общее количество страниц*/}
            {/*            />*/}
            {/*            <TouchableOpacity*/}
            {/*                onPress={() => openLink(`${url}${homeWork.lesson.lesson_file}`)}*/}
            {/*                style={GlobalStyle.btnOpenFile}>*/}
            {/*                <Text>*/}
            {/*                    Открыть файл PDF*/}
            {/*                </Text>*/}
            {/*            </TouchableOpacity>*/}
            {/*        </View>*/}
            {/*    )}*/}

            {/*    {homeWork?.lesson.lessonFileMedia && <View style={{flex: 1}}>*/}
            {/*    <Pdf*/}
            {/*        trustAllCerts={false}*/}
            {/*        horizontal*/}
            {/*        source={{uri: `${axios.defaults.baseURL}${homeWork?.lesson.lesson_file}`}}*/}
            {/*        style={{width: '100%', height: 240}}*/}
            {/*        page={currentPage}*/}
            {/*        onLoadComplete={handleLoadComplete}*/}
            {/*    />*/}
            {/*    <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 10}}>*/}
            {/*        <Button title="Назад" onPress={handlePreviousPage} disabled={currentPage === 1}/>*/}
            {/*        <Text>{`${currentPage}/${totalPages}`}</Text>*/}
            {/*        <Button title="Далее" onPress={handleNextPage} disabled={currentPage === totalPages}/>*/}
            {/*    </View>*/}

            {/*    </View>}*/}

            {/*</View>*/}
            {/*<ScormFile lesson={homeWork?.lesson}/>*/}
            {homeWork?.only_content === 1 ? (
              <TouchableOpacity
                style={styles.hintButton}
                onPress={() => {
                  handleSubmitWork()
                }}
              >
                {isPassWorkLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{ fontSize: 16 }}>Материал изучен</Text>
                )}
              </TouchableOpacity>
            ) : (
              <FlatList
                data={
                  homeWork?.lesson && homeWork?.lesson?.lessonTasks?.length > 0
                    ? homeWork?.lesson.lessonTasks
                    : homeWork?.homeWorkUniqueTasks
                }
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
            {homeWork?.comment && (
              <View style={{ marginBottom: 50 }}>
                <Text style={{ color: Colors.colorGray }}>Комментарий к работе</Text>
                <Text style={{ color: Colors.colorBlack, fontSize: 16, marginTop: 10 }}>
                  {homeWork.comment}
                </Text>
              </View>
            )}
            {isCompletedStatus === 'notCompleted' && homeWork?.only_content !== 1 && (
              <TouchableOpacity style={styles.hintButton} onPress={handleSubmitWork}>
                {isPassWorkLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{ fontSize: 16 }}>Сдать работу</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
        <Toast config={toastConfig} />
      </>
    </KeyboardAvoidingView>
  )
}

const IncompleteHomeWork = ({ task, index }: { task: LessonTasksType; index: number }) => {
  const dispatch = useAppDispatch()
  const { homeWork } = useAppSelector((state) => state.homeworkDetail)
  const { result } = useAppSelector((state) => state.answerPost)

  const isTimedTask = task.task.is_timed_task === 1

  useEffect(() => {
    if (isTimedTask && homeWork) {
      dispatch(fetchHomeworkTimer({ task_id: task.task.id, work_id: homeWork?.id }))
    }
  }, [])

  // Инициализируем состояние попыток
  const [attempts, setAttempts] = useState(2)
  // Определяем текст результата
  const [resultText, setResultText] = useState('')
  // Текст кнопки
  const [buttonSendText, setButtonSendText] = useState('Ответить')
  const [url, setUrlState] = useState<string | null>(null)
  const lessonId = homeWork?.id
  const childrenId = homeWork?.children.id

  const correct_answer = homeWork?.homeWorkResults.find((el) => el.task_id === task.task.id)
  const correct_answerHtml = correct_answer?.correct_answer
    ? renderCorrectAnswer(correct_answer?.correct_answer)
    : renderCorrectAnswer(task?.task?.correct_answer)
  const can_redo = homeWork?.can_redo

  // Показывать ли инпут
  const showInput = buttonSendText === 'Ответить' || buttonSendText === 'Ответить еще раз'

  // Показывать ли блок с правильным ответом
  const showCorrectAnswer =
    (!can_redo &&
      buttonSendText === 'Ответ принят' &&
      (resultText === 'Решено неверно' || resultText === 'Не верный ответ')) ||
    (can_redo && result[task.task.id]?.attempt <= -1) ||
    (can_redo && correct_answer?.attempt <= -1)

  useEffect(() => {
    const fetchUrl = async () => {
      const value = await getUrl()
      setUrlState(value)
    }
    fetchUrl()
  }, [])

  useEffect(() => {
    let newText = result[task.id]?.message || ''

    if (can_redo && homeWork?.status > 0) {
      if (
        ((task.task.type === 'detail-answer' || task.task.type === 'file-answer') &&
          result[task.task.id]?.decided) ||
        ((task.task.type === 'detail-answer' || task.task.type === 'file-answer') &&
          correct_answer?.attempt <= 1)
      ) {
        newText = 'Решение принято'
        setResultText(newText)
        return
      }
      if (correct_answer) {
        switch (correct_answer.score) {
          case 0:
            if (
              correct_answer.decided_right === 1 &&
              task.task.type !== 'detail-answer' &&
              task.task.type !== 'file-answer'
            ) {
              newText = 'Решено верно'
            } else if (
              correct_answer.decided_right === 0 &&
              task.task.type !== 'detail-answer' &&
              task.task.type !== 'file-answer'
            ) {
              newText = 'Решено неверно'
            }
            break
          case 1:
            if (
              (task.task.type === 'detail-answer' || task.task.type === 'file-answer') &&
              correct_answer?.attempt <= 1
            ) {
              newText = 'Решение принято'
            }

            break
          case 2:
            newText = 'Решение принято'
            break
          case 4:
            newText = 'Решение принято'
            break
          default:
            newText = 'Нет результата'
        }
      }
      setResultText(newText)
    } else {
      if (
        (task.task.type === 'detail-answer' || task.task.type === 'file-answer') &&
        correct_answer?.decided_right === 1
      ) {
        newText = 'Решение принято'
        setResultText(newText)
        return
      }

      if (
        (result[task.task.id] && task.task.type === 'detail-answer') ||
        (result[task.task.id] && task.task.type === 'file-answer')
      ) {
        newText = 'Решение принято'
        setResultText(newText)
        return
      }
      if (!newText && correct_answer) {
        switch (correct_answer.score) {
          case 0:
            if (
              correct_answer.decided_right === 1 &&
              task.task.type !== 'detail-answer' &&
              task.task.type !== 'file-answer'
            ) {
              newText = 'Решено верно'
            } else {
              newText = 'Решено неверно'
            }
            break
          case 1:
            newText = 'Решено верно'
            break
          case 2:
            newText = 'Решение принято'
            break
          case 4:
            newText = 'Решение принято'
            break
          default:
            newText = 'Нет результата'
        }
      }
      setResultText(newText)
    }
  }, [result, task.id, correct_answer, can_redo])

  // Определяем, нужно ли показывать подсказку
  const showHintCondition =
    resultText === 'Решено неверно' ||
    (result[task.id]?.message && result[task.id]?.message === 'Не верный ответ')

  useEffect(() => {
    //  console.log(index, 'result', 'Attempts', attempts, result[task.task.id], 'correct_answer', correct_answer);

    if (can_redo && homeWork?.status > 0) {
      if (
        (task.task.type === 'detail-answer' || task.task.type === 'file-answer') &&
        correct_answer?.attempt! <= 1 &&
        !result[task.task.id]
      ) {
        setButtonSendText('Ответ принят')
        // setAttempts(1); // Обнуляем попытки
        return
      }

      if (
        (task.task.type === 'detail-answer' || task.task.type === 'file-answer') &&
        result[task.task.id]?.decided
      ) {
        setButtonSendText('Ответ принят')
        return
      }
      if (
        correct_answer?.decided_right === 1 &&
        task.task.type !== 'detail-answer' &&
        task.task.type !== 'file-answer'
      ) {
        setButtonSendText('Ответ принят')
        return
      }
      if (correct_answer?.attempt! <= -1) {
        setButtonSendText('Ответ принят')
        // setAttempts(1); // Обнуляем попытки
        return
      }

      if (
        result[task.task.id]?.decided === true ||
        correct_answer?.attempt === -1 ||
        correct_answer?.attempt! <= -1
      ) {
        setButtonSendText('Ответ принят')
        // setAttempts(1); // Обнуляем попытки
        return
      }

      if (correct_answer?.attempt === 0 && !result[task.task.id]) {
        setButtonSendText('Ответить еще раз')
        return
      }
      if (result[task.task.id] && attempts === 1) {
        setButtonSendText('Ответить еще раз')
        return
      }
      if (correct_answer?.attempt === 0 && result[task.task.id]?.attempt === 0) {
        setButtonSendText('Ответить еще раз')
        return
      }
      // +
      if (correct_answer?.attempt === 1 && result[task.task.id]?.attempt === 0) {
        setButtonSendText('Ответить еще раз')
        return
      }
      // +
      if (correct_answer?.attempt === 1 && result[task.task.id]?.attempt === -1) {
        setButtonSendText('Ответ принят')
        return
      }

      if (correct_answer?.attempt === 0 && result[task.task.id]?.attempt === -1) {
        setButtonSendText('Ответ принят')
        return
      }

      if (result[task.task.id]?.attempt === -1 && correct_answer?.attempt === 0) {
        setButtonSendText('Ответ принят')
      }
    } else {
      // Если результат уже принят, больше отвечать не надо
      if (
        result[task.task.id]?.decided === true ||
        correct_answer?.attempt === 1 ||
        correct_answer?.decided_right === 1
      ) {
        setButtonSendText('Ответ принят')
        setAttempts(1) // Обнуляем попытки
        return
      }

      // Если результат был обнулен при перезагрузке, но есть данные в correct_answer
      if (correct_answer?.attempt === 2 && !result[task.task.id]) {
        setAttempts(2) // Восстанавливаем количество попыток из correct_answer
      }
      if (correct_answer?.attempt === 1) {
        setButtonSendText('Ответ принят')
      }

      if (result[task.task.id]?.attempt === 1) {
        setButtonSendText('Ответ принят')
      }
      // Логика попыток:
      if (result[task.task.id]?.attempt === 2) {
        // После первой попытки, если ответ неверный
        setButtonSendText('Ответить еще раз')
        setAttempts(2)
      } else if (result[task.task.id]?.attempt === 1) {
        setButtonSendText('Ответ принят')
        setAttempts(1)
      } else if (correct_answer?.attempt === 2) {
        setButtonSendText('Ответить еще раз')
        setAttempts(2)
      } else if (attempts === 0) {
        // Если попыток больше нет
        setButtonSendText('Ответ принят')
      } else {
        // Если ученик может еще отвечать
        setButtonSendText('Ответить')
      }
    }
  }, [result, correct_answer, task.task.id, attempts])

  const handleSubmit = async (answer: string, taskId?: string, answerData?: SendAnswerPayload) => {
    const data = {
      answer,
      children_id: homeWork?.children.id,
      answer_type: 'text',
      task_id: task?.task.id,
      lesson_id: homeWork?.id,
    }

    // console.log('answer', data)
    // console.log('answerData', answerData)

    try {
      // Ожидаем выполнения dispatch, если sendAnswer возвращает промис
      await dispatch(sendAnswer(answerData ? answerData : data)).unwrap()
      // Уменьшаем количество попыток после успешной отправки ответа
      setAttempts(attempts - 1)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: error?.error,
        position: 'bottom',
        bottomOffset: 50,
      })
      console.error('Error submitting answer:', error)
      // Здесь можно обработать ошибку, например, показать сообщение пользователю
    }
  }

  const taskProps = {
    handleSubmit,
    resultText,
    showHintCondition,
    showInput,
    buttonSendText,
    correct_answerHtml,
    result,
    correct_answer,
    lessonId,
    childrenId,
    showCorrectAnswer,
    url,
    isTimedTask,
  }

  return <View style={styles.container}>{renderTaskComponent(task.task, index, taskProps)}</View>
}

type HomeWorkItemProps = {
  task: LessonTasksType
  index: number
}

export const ViewHomeWork = ({ task, index }: HomeWorkItemProps) => {
  const [url, setUrlState] = useState<string | null>('')

  useEffect(() => {
    const fetchUrl = async () => {
      const value = await getUrl()
      setUrlState(value)
    }
    fetchUrl()
  }, [])

  //  const {homeWork} = useAppSelector(state => state.homeworkDetail);

  //   const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.task.id)

  const renderViewHomeWork = (task: Task) => {
    // console.log(task.type)

    switch (task.type) {
      case 'test':
        return <ViewTestAnswerHomeWork task={task} index={index} url={url!} />
      case 'pass-words':
        return <ViewPassWordsAnswerHomeWork task={task} index={index} />
      case 'match':
        return <ViewMatchAnswerHomeWork task={task} index={index} />
      case 'detail-answer':
        return <ViewOrderAndDetailAnswerHomeWork task={task} index={index} />
      case 'file-answer':
        return <ViewFileAnswerHomeWork task={task} index={index} url={url!} />
      case 'order':
        return <ViewOrderAndDetailAnswerHomeWork task={task} index={index} url={url!} />
      case 'multiple-choice':
        return <ViewOrderAndDetailAnswerHomeWork task={task} index={index} url={url!} />
      case 'exact-answer':
        return <ViewOrderAndDetailAnswerHomeWork task={task} index={index} url={url!} />
      case 'basket':
        return <ViewBasketAnswerHomeWork task={task} index={index} url={url!} />
      default:
        return (
          <View>
            <Text>test {task.type}</Text>
          </View>
        )
    }
  }

  return <View style={styles.container}>{renderViewHomeWork(task.task)}</View>
}

// Стили для компонента
const styles = StyleSheet.create({
  container: {},
  headerBlock: {
    flexDirection: 'row',
    // paddingHorizontal: 15,
    gap: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bgCard,
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  section: {
    marginBottom: 10,
  },
  Hintsection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  hintButton: {
    backgroundColor: '#fdc243',
    padding: 10,
    // width: '50%',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#f1e6f6',
    borderRadius: 10,
    //  alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 10,
  },
  hintButtonText: {
    color: Colors.colorBlack,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 220,
    marginRight: 10,
    borderRadius: 5,
  },
  materialsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  answerBlock: {
    //  width: '50%',
    backgroundColor: Colors.colorAccentFirst,
    borderRadius: 10,
    padding: 8,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 7,
    fontSize: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    marginBottom: 8,
  },
  videoContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  videoLink: {
    color: '#007bff',
    textAlign: 'center',
  },
  answerText: {
    fontSize: 16,
    // marginBottom: 8,
    color: 'green',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
})

// Функция для парсинга и отображения правильного ответа
export const renderCorrectAnswer = (json: string) => {
  try {
    const parsedAnswer = JSON.parse(json) // Парсим JSON строку
    return parsedAnswer.map((item: { text: string; index: number }) => (
      <Text key={item.index} style={styles.answerText}>
        {item.text}
      </Text>
    ))
  } catch (error) {
    //  console.error('Failed to parse correct answer JSON:', error);
    return null
    //  return <Text style={styles.errorText}>Ошибка при загрузке правильного ответа</Text>;
  }
}
