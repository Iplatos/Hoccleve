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

export const JournalScreen = () => {
  const dispatch = useAppDispatch()
  const { data: dataUS, loading, error } = useAppSelector((state) => state.generalStudentJournal)
  const [startDate, setStartDate] = useState('2025-09-01')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [endDate, setEndDate] = useState('2025-09-05')

  useEffect(() => {
    const loadInitialData = async () => {
      await dispatch(fetchJournalData({ start_date: startDate, end_date: endDate }))
      setIsInitialLoad(false)
    }

    loadInitialData()
    console.log(dataUS)
  }, [dispatch])
  const testData = {
    directions: [
      {
        id: '5',
        name: 'Завтрак',
        absences: 3,
        attendance: 0,
        dates: {
          '38115': { grades: [], status: null, comment: null },
        },
        gpa: null,
        group_id: 378,
        visits: 0,
      },
      {
        id: '227',
        name: 'Русский язык/Литература 5 класс',
        absences: 6,
        attendance: 0,
        dates: {
          '38159': { grades: [5, 4], status: 'present', comment: 'Хорошая работа' },
          '38291': { grades: [], status: null, comment: null },
          '39215': { grades: [], status: null, comment: null },
          '39303': { grades: [], status: null, comment: null },
          '61445': { grades: [], status: null, comment: null },
          '61577': { grades: [], status: null, comment: null },
        },
        gpa: null,
        group_id: 349,
        visits: 0,
      },
      {
        id: '228',
        name: '5 класс: Литература (старое)',
        absences: 6,
        attendance: 0,
        dates: {
          '38203': { grades: [3], status: 'absent', comment: 'Отсутствовал' },
          '45116': { grades: [], status: null, comment: null },
          '45160': { grades: [], status: null, comment: null },
          '45204': { grades: [], status: null, comment: null },
          '61489': { grades: [], status: null, comment: null },
          '61621': { grades: [], status: null, comment: null },
        },
        gpa: null,
        group_id: 345,
        visits: 0,
      },
    ],
    dates: [
      {
        id: '38115',
        date: '2025-09-02',
        ids: ['5'],
        lesson_topic: 'Утренний завтрак',
        comment_to_dz: null,
      },
      {
        id: '38159',
        date: '2025-09-02',
        ids: ['227'],
        lesson_topic: 'Литературное чтение',
        comment_to_dz: 'Выучить стих',
      },
      {
        id: '38203',
        date: '2025-09-02',
        ids: ['228'],
        lesson_topic: 'Русская литература',
        comment_to_dz: 'Прочитать рассказ',
      },
      {
        id: '38291',
        date: '2025-09-02',
        ids: ['227'],
        lesson_topic: 'Правописание',
        comment_to_dz: null,
      },
      {
        id: '38775',
        date: '2025-09-03',
        ids: ['5'],
        lesson_topic: 'Второй завтрак',
        comment_to_dz: null,
      },
      {
        id: '38995',
        date: '2025-09-03',
        ids: ['227'],
        lesson_topic: 'Грамматика',
        comment_to_dz: 'Упражнения 1-5',
      },
      {
        id: '39215',
        date: '2025-09-03',
        ids: ['227'],
        lesson_topic: 'Чтение',
        comment_to_dz: null,
      },
      {
        id: '39303',
        date: '2025-09-03',
        ids: ['227'],
        lesson_topic: 'Сочинение',
        comment_to_dz: null,
      },
      {
        id: '45116',
        date: '2025-09-02',
        ids: ['228'],
        lesson_topic: 'Классическая литература',
        comment_to_dz: null,
      },
      {
        id: '45160',
        date: '2025-09-03',
        ids: ['228'],
        lesson_topic: 'Поэзия',
        comment_to_dz: null,
      },
      { id: '45204', date: '2025-09-03', ids: ['228'], lesson_topic: 'Проза', comment_to_dz: null },
    ],
  }

  const data = dataUS !== null && dataUS !== undefined ? dataUS : testData

  const statusData = [
    { label: 'Периоды по умолчанию', value: 0 },
    { label: 'Периоды по дням', value: 5 },
    { label: 'выбрать период', value: 10 },
  ]

  const [status, setStatus] = useState(statusData[0].value)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

  const FIXED_COLUMN_WIDTH = 100
  let DATA_COLUMN_WIDTH = 50

  const horizontalScrollRef = useRef(null)
  const datesHorizontalScrollRef = useRef(null)
  const verticalScrollRef = useRef(null)
  const fixedColumnScrollRef = useRef(null)

  const isScrolling = useRef(false)

  // Получаем уникальные даты и сортируем их
  const dates = [...new Set(data.dates.map((item) => item.date))].sort()
  const totalDataWidth = DATA_COLUMN_WIDTH * dates.length
  if (dates.length < 6) {
    DATA_COLUMN_WIDTH = 282 / dates.length
  }
  // Функция для получения данных урока по предмету и дате
  const getLessonData = (directionId, date) => {
    // Находим ID даты для этой даты
    const dateObj = data.dates.find((d) => d.date === date && d.ids.includes(directionId))
    if (!dateObj) return null

    // Находим направление
    const direction = data.directions.find((dir) => dir.id === directionId)
    if (!direction || !direction.dates) return null

    return direction.dates[dateObj.id] || null
  }

  // Функция для отображения оценок
  const renderGrades = (grades) => {
    if (!grades || grades.length === 0) return '-'
    return grades.join(', ')
  }

  // Функция для отображения статуса
  const renderStatus = (status) => {
    switch (status) {
      case 'present':
        return '✓'
      case 'absent':
        return '✗'
      case 'late':
        return '⌚'
      default:
        return '-'
    }
  }

  // Функция для получения темы урока
  const getLessonTopic = (directionId, date) => {
    const dateObj = data.dates.find((d) => d.date === date && d.ids.includes(directionId))
    return dateObj?.lesson_topic || '-'
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

  const openModal = (direction, date, lessonData, topic) => {
    setSelectedCell({
      direction: direction.name,
      date: date,
      topic: topic,
      grades: lessonData?.grades || [],
      status: lessonData?.status || 'нет данных',
      comment: lessonData?.comment || 'нет комментария',
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
  if (isInitialLoad) {
    return <Text>Loading</Text>
  }
  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.dropdownContainer}>
        <DropdownForJournal />
        <DropdownForJournal />
      </View> */}

      <View style={styles.tableContainer}>
        <View style={styles.fixedColumn}>
          {/* Заголовок фиксированного столбца */}
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
                {dates.map((date, index) => (
                  <View key={index} style={[styles.dateHeader, { width: DATA_COLUMN_WIDTH }]}>
                    <Text style={styles.headerText}>{formatDate(date)}</Text>
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
                      {dates.map((date, cellIndex) => {
                        const lessonData = getLessonData(direction.id, date)
                        const topic = getLessonTopic(direction.id, date)

                        return (
                          <View
                            key={cellIndex}
                            style={[styles.dataCell, { width: DATA_COLUMN_WIDTH }]}
                          >
                            <TouchableOpacity
                              style={styles.cellContent}
                              onPress={() => openModal(direction, date, lessonData, topic)}
                            >
                              <Text style={styles.gradesText}>
                                {renderGrades(lessonData?.grades)}
                              </Text>
                              <Text style={styles.statusText}>
                                {renderStatus(lessonData?.status)}
                              </Text>
                              {lessonData?.comment && (
                                <Text style={styles.commentIndicator}>💬</Text>
                              )}
                            </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Информация об уроке</Text>

            {selectedCell && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Предмет:</Text>
                  <Text style={styles.modalValue}>{selectedCell.direction}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Дата:</Text>
                  <Text style={styles.modalValue}>{selectedCell.date}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Тема урока:</Text>
                  <Text style={styles.modalValue}>{selectedCell.topic}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Оценки:</Text>
                  <Text style={styles.modalValue}>
                    {selectedCell.grades.length > 0 ? selectedCell.grades.join(', ') : 'нет оценок'}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Статус:</Text>
                  <Text style={styles.modalValue}>
                    {selectedCell.status === 'present'
                      ? 'Присутствовал'
                      : selectedCell.status === 'absent'
                      ? 'Отсутствовал'
                      : selectedCell.status === 'late'
                      ? 'Опоздал'
                      : 'нет данных'}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Комментарий:</Text>
                  <Text style={styles.modalValue}>{selectedCell.comment}</Text>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

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
  cellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  gradesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  // Стили для модального окна
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  modalLabel: {
    fontWeight: '600',
    color: '#555',
    width: 100,
    fontSize: 14,
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
})

export default JournalScreen
