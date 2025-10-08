import React, { useEffect, useRef, useState } from 'react'
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native'
import DropdownForJournal from '../components/DropdownComponent/DropdownForJournal/DropdownForJournal'
import { useDispatch, useSelector } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchJournalData, setParams } from '../redux/slises/generalStudentJournalSlice'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Функция для удаления дубликатов по ID
const removeDuplicates = (dates) => {
  const newDates = []
  dates.forEach((date) => {
    if (!newDates.some((newDate) => newDate.id == date.id)) newDates.push(date)
  })
  return newDates
}
const getSortByField = (field) => (el1, el2) => {
  if (el1[field] > el2[field]) return 1
  if (el1[field] < el2[field]) return -1
  if (el1[field] == el2[field]) return 0
}
// Функция для объединения дат
const getUnionDate = (dates) => {
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

export const JournalScreen = () => {
  const dispatch = useAppDispatch()
  const { data: dataUS, loading, error } = useAppSelector((state) => state.generalStudentJournal)
  const [startDate, setStartDate] = useState('2025-10-01')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [endDate, setEndDate] = useState('2025-10-02')

  useEffect(() => {
    const loadInitialData = async () => {
      await dispatch(fetchJournalData({ start_date: startDate, end_date: endDate }))
      setIsInitialLoad(false)
    }

    loadInitialData()
    console.log(dataUS)
  }, [dispatch])
  console.log(dataUS)

  const data = dataUS !== null && dataUS !== undefined ? dataUS : { directions: [], dates: [] }

  // Применяем обе функции: сначала удаляем дубликаты, потом объединяем даты
  const unionDates =
    data.dates && data.dates.length > 0
      ? getUnionDate(removeDuplicates(data.dates)).slice().sort(getSortByField('date'))
      : []

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

  const FIXED_COLUMN_WIDTH = 100
  let DATA_COLUMN_WIDTH = 80

  const horizontalScrollRef = useRef(null)
  const datesHorizontalScrollRef = useRef(null)
  const verticalScrollRef = useRef(null)
  const fixedColumnScrollRef = useRef(null)

  const isScrolling = useRef(false)

  // Используем объединенные даты после удаления дубликатов
  const dates = unionDates
  const totalDataWidth = DATA_COLUMN_WIDTH * dates.length
  if (dates.length < 6) {
    DATA_COLUMN_WIDTH = 282 / dates.length
  }

  // Функция для получения данных урока по предмету и объединенной дате
  const getLessonData = (directionId, unionDate) => {
    // Проверяем, есть ли данный предмет в этой объединенной дате
    if (!unionDate.ids.includes(directionId)) return null

    // Находим направление
    const direction = data.directions.find((dir) => dir.id === directionId)
    if (!direction || !direction.dates) return null

    // Получаем ID оригинального урока из directionsToDates
    const originalLessonId = unionDate.directionsToDates[directionId]

    // Получаем данные для конкретного урока
    return {
      lessonId: originalLessonId,
      lessonData: direction.dates[originalLessonId] || null,
      topic: unionDate.directionsToTooltip[directionId]?.topic || '-',
      homeworkComment: unionDate.directionsToTooltip[directionId]?.commentDZ || null,
    }
  }
  const statuses = [
    { status: 'П+', value: '10' },
    { status: 'П', value: '5' },
    { status: 'П-', value: '3' },
    { status: 'Н', value: '0' },
  ]
  // Функция для отображения оценок для одного урока
  const renderGrades = (lesson) => {
    if (!lesson || !lesson.lessonData?.grades || lesson.lessonData.grades.length === 0) return ''

    const grades = lesson.lessonData.grades.map((grade: number) =>
      typeof grade === 'object' ? grade.grade : grade
    )

    return '/' + grades.join(', ')
  }

  // Функция для отображения статуса для одного урока
  const renderStatus = (lesson) => {
    if (!lesson || !lesson.lessonData) return ''

    const status = lesson.lessonData.status

    switch (status) {
      case '10':
        return 'П+'
      case '5':
        return 'П'
      case '3':
        return 'П-'
      case '0':
        return 'Н'
      default:
        return ''
    }
  }

  // Функция для получения цвета статуса
  const getStatusColor = (lesson) => {
    console.log(lesson)

    if (!lesson || !lesson.lessonData) return '#f4f4f4'

    const status = lesson.lessonData.status

    switch (status) {
      case '10':
        return '#a0daa2'
      case '5':
        return '#9dc49b'
      case '3':
        return '#FFDDDF'
      case '0':
        return '#FCA0A7'
      default:
        return 'white'
    }
  }

  // Проверяем есть ли комментарий в уроке
  const hasComment = (lesson) => {
    return lesson && lesson.lessonData?.comment
  }

  // Проверяем есть ли урок для данной клетки
  const hasLesson = (lesson) => {
    return lesson !== null
  }

  // Синхронизация горизонтальной прокрутки
  const handleHorizontalScroll = (event) => {
    if (isScrolling.current) return
    const offsetX = event.nativeEvent.contentOffset.x
    isScrolling.current = true

    if (datesHorizontalScrollRef.current) {
      datesHorizontalScrollRef.current.scrollTo({ x: offsetX, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  const handleDatesHorizontalScroll = (event) => {
    if (isScrolling.current) return
    const offsetX = event.nativeEvent.contentOffset.x
    isScrolling.current = true

    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({ x: offsetX, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  const handleFixedColumnScroll = (event) => {
    if (isScrolling.current) return
    const offsetY = event.nativeEvent.contentOffset.y
    isScrolling.current = true

    if (verticalScrollRef.current) {
      verticalScrollRef.current.scrollTo({ y: offsetY, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  const openModal = (direction, unionDate, lesson) => {
    setSelectedCell({
      direction: direction.name,
      date: unionDate.date,
      lesson: lesson,
      topic: lesson.topic,
    })
    setIsModalVisible(true)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setSelectedCell(null)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`
  }

  // Функция для отображения количества предметов в дате

  if (isInitialLoad) {
    return <Text>Loading</Text>
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tableContainer}>
        <View style={styles.fixedColumn}>
          <View style={[styles.fixedHeader, { width: FIXED_COLUMN_WIDTH }]}>
            <Text style={styles.headerText}>Предметы</Text>
          </View>

          <ScrollView
            ref={fixedColumnScrollRef}
            style={styles.fixedRows}
            showsVerticalScrollIndicator={false}
            onScroll={handleFixedColumnScroll}
            scrollEventThrottle={16}
          >
            {data.directions.map((direction, index) => (
              <View key={direction.id} style={[styles.fixedCell, { width: FIXED_COLUMN_WIDTH }]}>
                <Text style={styles.cellText} numberOfLines={2}>
                  {direction.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.fixedDatesHeader}>
            <ScrollView
              ref={datesHorizontalScrollRef}
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.datesHorizontalScroll}
              onScroll={handleDatesHorizontalScroll}
              scrollEventThrottle={16}
            >
              <View style={[styles.datesHeader, { width: totalDataWidth }]}>
                {dates.map((unionDate, index) => (
                  <View key={index} style={[styles.dateHeader, { width: DATA_COLUMN_WIDTH }]}>
                    <Text style={styles.headerText}>{formatDate(unionDate.date)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.mainScroll}>
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              onScroll={handleHorizontalScroll}
              scrollEventThrottle={16}
            >
              <View style={[styles.dataContent, { width: totalDataWidth }]}>
                <View style={styles.dataContainer}>
                  {data.directions.map((direction, rowIndex) => (
                    <View key={direction.id} style={styles.dataRow}>
                      {dates.map((unionDate, cellIndex) => {
                        const lesson = getLessonData(direction.id, unionDate)
                        const hasLessonData = hasLesson(lesson)
                        const statusColor = getStatusColor(lesson)

                        return (
                          <View
                            key={cellIndex}
                            style={[
                              styles.dataCell,
                              { width: DATA_COLUMN_WIDTH },
                              !hasLessonData && styles.emptyCell,
                              ,
                              { backgroundColor: statusColor },
                            ]}
                          >
                            {hasLessonData ? (
                              <TouchableOpacity
                                style={styles.cellContent}
                                onPress={() => openModal(direction, unionDate, lesson)}
                                disabled={!lesson?.lessonData.status}
                              >
                                <Text style={styles.gradesText}>{renderStatus(lesson)}</Text>
                                <Text style={styles.gradesText}>{renderGrades(lesson)}</Text>

                                {hasComment(lesson) && (
                                  <Text style={styles.commentIndicator}>💬</Text>
                                )}
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.cellContent}>
                                <Text style={styles.emptyCellText}></Text>
                              </View>
                            )}
                          </View>
                        )
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCell && (
              <>
                {/* Блок со статусами в левом верхнем углу */}
                <View style={styles.statusRow}>
                  <View style={styles.statusBlock}>
                    <View style={styles.statusHeader}>
                      <Text style={styles.statusTitle}>Статус</Text>
                    </View>
                    <View style={styles.statusGrid}>
                      {statuses.map((s, i) => (
                        <View
                          key={i}
                          style={[
                            styles.statusItem,
                            {
                              backgroundColor:
                                s.value === selectedCell.lesson.lessonData?.status
                                  ? getStatusColor(selectedCell.lesson)
                                  : '',
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>{s.status}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  {/* Новый блок с комментарием */}
                  <View style={styles.commentBlock}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentTitle}>Комментарий</Text>
                    </View>
                    <View style={styles.commentContent}>
                      <Text style={styles.commentText}>
                        {selectedCell.lesson.lessonData?.comment || 'нет комментария'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Новый блок с оценками и комментариями к ним */}
                <View style={styles.gradesRow}>
                  <View style={styles.gradesBlock}>
                    <View style={styles.gradesHeader}>
                      <Text style={styles.gradesTitle}>Оценка</Text>
                    </View>
                    <View style={styles.gradesContent}>
                      {selectedCell.lesson.lessonData?.grades?.length > 0 ? (
                        selectedCell.lesson.lessonData?.grades.map((grade, index) => (
                          <View key={index} style={styles.gradeItem}>
                            <Text style={styles.gradeText}>
                              {typeof grade === 'object' ? grade.grade : grade}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noGradesText}>нет оценок</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.gradesCommentBlock}>
                    <View style={styles.gradesCommentHeader}>
                      <Text style={styles.gradesCommentTitle}>Комментарий</Text>
                    </View>
                    <View style={styles.gradesCommentContent}>
                      {selectedCell.lesson.lessonData?.grades?.length > 0 ? (
                        selectedCell.lesson.lessonData?.grades.map((grade, index) => (
                          <View key={index} style={styles.gradeCommentItem}>
                            <Text style={styles.gradeCommentText}>
                              {typeof grade === 'object'
                                ? grade.comment || 'нет комментария'
                                : 'нет комментария'}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noGradesText}>нет комментариев</Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Кнопка закрытия под блоком с оценками */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>

                {/* Остальная информация об уроке */}
                <View style={styles.lessonInfo}>{/* ... остальные строки модалки ... */}</View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

// Стили остаются такими же...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 400,
  },
  fixedColumn: {
    minWidth: 100,
    backgroundColor: '#fff',
    borderRightWidth: 2,
    borderRightColor: '#ccc',
    zIndex: 3,
  },
  fixedHeader: {
    height: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  fixedRows: {
    flex: 1,
  },
  fixedCell: {
    height: 60,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  fixedDatesHeader: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    zIndex: 2,
  },
  datesHorizontalScroll: {
    flex: 1,
  },
  datesHeader: {
    flexDirection: 'row',
    height: 50,
  },
  dateHeader: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  mainScroll: {
    flex: 1,
  },
  horizontalScroll: {
    flex: 1,
  },
  dataContent: {
    flexDirection: 'column',
  },
  dataContainer: {
    flexDirection: 'column',
  },
  dataRow: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataCell: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  emptyCell: {
    backgroundColor: '#f5f5f5',
  },
  cellContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    width: '100%',
  },
  gradesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  emptyCellText: {
    fontSize: 14,
    color: '#999',
  },
  commentIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '40%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  modalLabel: {
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    width: 100,
    fontSize: 14,
    alignItems: 'center',
  },
  modalValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    flexWrap: 'wrap',
  },
  modalButtons: {
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
  },
  closeButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  // Стили для блоков в модалке
  statusRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  statusBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  commentBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  gradesBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  gradesCommentBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  // Общие стили для шапок
  statusHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40, // фиксированная высота для всех шапок
    justifyContent: 'center',
  },
  commentHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  gradesHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  gradesCommentHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
    justifyContent: 'center',
  },

  // Общие стили для контента
  statusGrid: {
    flexDirection: 'row',
    height: 40, // такая же высота как у шапки
  },
  commentContent: {
    padding: 12,
    height: 40, // такая же высота как у шапки
    justifyContent: 'center',
  },
  gradesContent: {
    padding: 12,
    minHeight: 40, // такая же высота как у шапки
    justifyContent: 'center',
  },
  //////////
  gradesCommentContent: {
    padding: 12,
    minHeight: 40, // такая же высота как у шапки
    justifyContent: 'center',
  },

  // Для статусов убираем вертикальные отступы
  statusItem: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    width: '25%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    height: 40, // фиксированная высота ячеек статуса
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  commentText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  gradesRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  gradeItem: {
    borderBottomColor: '#f0f0f0',
  },
  gradeText: {
    fontSize: 12,
    textAlign: 'center',
    borderBottomColor: '#f0f0f0',

    color: '#333',
  },
  noGradesText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  gradeCommentItem: {
    // borderBottomWidth: 1,
  },
  gradeCommentText: {
    fontSize: 12,
    textAlign: 'left', // выравнивание по левому краю
    color: '#333',
  },
  lessonInfo: {
    marginTop: 80,
    marginLeft: 350,
  },
})
