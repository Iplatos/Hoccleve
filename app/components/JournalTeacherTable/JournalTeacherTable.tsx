// components/JournalTeacherTable/JournalTeacherTable.tsx
import React, { useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface JournalTeacherTableProps {
  data: any
  dates: any[]
  onCellPress: (student: any, date: any, lessonData: any) => void
}

const getTestData = () => {
  const testDates = [
    { id: '89286', date: '2025-10-06' },
    { id: '89333', date: '2025-10-03' },
    { id: '89334', date: '2025-10-04' },
    { id: '89335', date: '2025-10-05' },
  ]

  const testStudents = [
    {
      id: 1,
      name: 'Иванов Алексей Петрович',
      gpa: 4.5,
      dates: {
        '89286': {
          status: '10',
          grades: [{ grade: 5, weight: 1, comment: 'Отлично' }],
          comment: '',
        },
        '89333': {
          status: '5',
          grades: [
            { grade: 4, weight: 1, comment: 'Хорошо asdda asd asdaw a asd  sada sda sda sdasd ' },
          ],
          comment: '',
        },
        '89334': {
          status: '3',
          grades: [{ grade: 3, weight: 1, comment: 'Удовлетворительно' }],
          comment: '',
        },
        '89335': { status: '0', grades: [], comment: 'Отсутствовал' },
      },
    },
    {
      id: 2,
      name: 'Петрова Мария Сергеевна',
      gpa: 4.8,
      dates: {
        '89286': { status: '10', grades: [{ grade: 5, weight: 1, comment: '' }], comment: '' },
        '89333': { status: '10', grades: [{ grade: 5, weight: 1, comment: '' }], comment: '' },
        '89334': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
        '89335': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
      },
    },
    {
      id: 3,
      name: 'Сидоров Дмитрий Иванович',
      gpa: 3.2,
      dates: {
        '89286': { status: '3', grades: [{ grade: 3, weight: 1, comment: '' }], comment: '' },
        '89333': { status: '0', grades: [], comment: 'Болел' },
        '89334': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
        '89335': { status: '3', grades: [{ grade: 3, weight: 1, comment: '' }], comment: '' },
      },
    },
    {
      id: 4,
      name: 'Козлова Анна Владимировна',
      gpa: 4.0,
      dates: {
        '89286': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
        '89333': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
        '89334': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
        '89335': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
      },
    },
    {
      id: 5,
      name: 'Николаев Артем Олегович',
      gpa: 3.9,
      dates: {
        '89286': { status: '10', grades: [{ grade: 5, weight: 1, comment: '' }], comment: '' },
        '89333': { status: '3', grades: [{ grade: 3, weight: 1, comment: '' }], comment: '' },
        '89334': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
        '89335': { status: '5', grades: [{ grade: 4, weight: 1, comment: '' }], comment: '' },
      },
    },
  ]

  return {
    dates: testDates,
    children: testStudents,
  }
}

export const JournalTeacherTable: React.FC<JournalTeacherTableProps> = ({
  data,
  dates,
  onCellPress,
}) => {
  const FIXED_COLUMN_WIDTH = 30
  const DATA_COLUMN_WIDTH = 60

  const horizontalScrollRef = useRef(null)
  const datesHorizontalScrollRef = useRef(null)
  const verticalScrollRef = useRef(null)
  const fixedColumnScrollRef = useRef(null)
  const isScrolling = useRef(false)
  console.log(data)
  console.log(dates)

  const displayData = data?.children?.length > 0 ? data : getTestData()

  const rawDates = dates?.length > 0 ? dates : displayData.dates || []
  const sortedDates = [...rawDates].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const displayDates = sortedDates

  const totalDataWidth = DATA_COLUMN_WIDTH * (displayDates.length + 2.5)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
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
        return '#f4f4f4'
    }
  }

  const renderStatus = (status: string) => {
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

  const renderGrades = (grades: any[]) => {
    if (!grades || grades.length === 0) return ''
    return grades.map((grade: any) => grade.grade).join(', ')
  }

  // Функции прокрутки
  const handleHorizontalScroll = (event: any) => {
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

  const handleDatesHorizontalScroll = (event: any) => {
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

  const handleFixedColumnScroll = (event: any) => {
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

  return (
    <View style={styles.tableContainer}>
      {/* ФИКСИРОВАННАЯ КОЛОНКА - ТОЛЬКО НОМЕР */}
      <View style={styles.fixedColumn}>
        <View style={[styles.fixedHeader, { width: FIXED_COLUMN_WIDTH }]}>
          <Text style={styles.headerText}>№</Text>
        </View>
        <ScrollView
          ref={fixedColumnScrollRef}
          style={styles.fixedRows}
          showsVerticalScrollIndicator={false}
          onScroll={handleFixedColumnScroll}
          scrollEventThrottle={16}
        >
          {displayData.children.map((student: any, index: number) => (
            <View key={student.id} style={[styles.fixedCell, { width: FIXED_COLUMN_WIDTH }]}>
              <Text style={styles.cellText}>{index + 1}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ОСНОВНАЯ ЧАСТЬ ТАБЛИЦЫ (включая имена) */}
      <View style={styles.mainContent}>
        {/* ЗАГОЛОВОК - ИМЕНА, СРЕДНИЙ БАЛЛ И ДАТЫ */}
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
              {/* ИМЕНА УЧЕНИКОВ */}
              <View style={[styles.dateHeader, { width: FIXED_COLUMN_WIDTH * 3 }]}>
                <Text style={styles.headerText}>Ученик</Text>
              </View>

              {/* СРЕДНИЙ БАЛЛ */}
              <View style={[styles.dateHeader, { width: DATA_COLUMN_WIDTH }]}>
                <Text style={styles.headerText}>Ср. балл</Text>
              </View>

              {/* ДАТЫ */}
              {displayDates.map((date: any, index: number) => (
                <View key={index} style={[styles.dateHeader, { width: DATA_COLUMN_WIDTH }]}>
                  <Text style={styles.headerText}>{formatDate(date.date)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ДАННЫЕ */}
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
                {displayData.children.map((student: any) => (
                  <View key={student.id} style={styles.dataRow}>
                    {/* ИМЯ УЧЕНИКА */}
                    <View style={[styles.dataCell, { width: FIXED_COLUMN_WIDTH * 3 }]}>
                      <View style={styles.cellContent}>
                        <Text style={styles.cellText} numberOfLines={2}>
                          {student.name}
                        </Text>
                      </View>
                    </View>

                    {/* СРЕДНИЙ БАЛЛ */}
                    <View style={[styles.dataCell, { width: DATA_COLUMN_WIDTH }]}>
                      <View style={styles.cellContent}>
                        <Text style={styles.gpaText}>{student.gpa || '0'}</Text>
                      </View>
                    </View>

                    {/* ЯЧЕЙКИ С ДАТАМИ */}
                    {displayDates.map((date: any, dateIndex: number) => {
                      const lessonData = student.dates?.[date.id]
                      const grades = lessonData?.grades || []
                      const status = lessonData?.status || ''
                      const statusColor = getStatusColor(status)

                      return (
                        <View
                          key={dateIndex}
                          style={[
                            styles.dataCell,
                            { width: DATA_COLUMN_WIDTH, backgroundColor: statusColor },
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.cellContent}
                            onPress={() => onCellPress(student, date, lessonData)}
                          >
                            <Text style={styles.gradesText}>{renderGrades(grades)}</Text>
                            <Text style={styles.statusText}>{renderStatus(status)}</Text>
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 400,
  },
  fixedColumn: {
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
    width: '100%',
  },
  gradesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  gpaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6E368C',
    textAlign: 'center',
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
})
