import React, { useRef, useState } from 'react'
import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

interface JournalTableProps {
  data: any
  dates: any[]
  onCellPress: (direction: any, unionDate: any, lesson: any) => void
}

export const JournalStudentTable: React.FC<JournalTableProps> = ({ data, dates, onCellPress }) => {
  const FIXED_COLUMN_WIDTH = 80
  const DATA_COLUMN_WIDTH = 60

  const horizontalScrollRef = useRef(null)
  const datesHorizontalScrollRef = useRef(null)
  const verticalScrollRef = useRef(null)
  const fixedColumnScrollRef = useRef(null)
  const isScrolling = useRef(false)

  const totalDataWidth = DATA_COLUMN_WIDTH * (dates.length + 1)

  // Функции для получения данных урока, статусов и т.д.
  const getLessonData = (directionId, unionDate) => {
    if (!unionDate.ids.includes(directionId)) return null
    const direction = data.directions.find((dir) => dir.id === directionId)
    if (!direction || !direction.dates) return null
    const originalLessonId = unionDate.directionsToDates[directionId]
    return {
      lessonId: originalLessonId,
      lessonData: direction.dates[originalLessonId] || null,
      topic: unionDate.directionsToTooltip[directionId]?.topic || '-',
      homeworkComment: unionDate.directionsToTooltip[directionId]?.commentDZ || null,
    }
  }

  const renderGrades = (lesson) => {
    if (!lesson || !lesson.lessonData?.grades || lesson.lessonData.grades.length === 0) return ''
    const grades = lesson.lessonData.grades.map((grade: number) =>
      typeof grade === 'object' ? grade.grade : grade
    )
    return '/' + grades.join(', ')
  }

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

  const getStatusColor = (lesson) => {
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

  const hasComment = (lesson) => {
    return lesson && lesson.lessonData?.comment
  }

  const hasLesson = (lesson) => {
    return lesson !== null
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`
  }

  // Функции прокрутки
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

  return (
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
            <View style={[styles.datesHeader, { width: totalDataWidth + DATA_COLUMN_WIDTH }]}>
              <View style={[styles.dateHeader, { width: DATA_COLUMN_WIDTH }]}>
                <Text style={styles.headerText}>Ср. балл</Text>
              </View>
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
                    <View style={[styles.dataCell, { width: DATA_COLUMN_WIDTH }]}>
                      <View style={styles.cellContent}>
                        <Text style={styles.gpaText}>{direction.gpa || '0'}</Text>
                      </View>
                    </View>
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
                            { backgroundColor: statusColor },
                          ]}
                        >
                          {hasLessonData ? (
                            <TouchableOpacity
                              style={styles.cellContent}
                              onPress={() => onCellPress(direction, unionDate, lesson)}
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
  )
}

const styles = StyleSheet.create({
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
  gpaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6E368C',
    textAlign: 'center',
  },
})
