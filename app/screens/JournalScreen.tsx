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
  const { data, loading, error } = useAppSelector((state) => state.generalStudentJournal)
  const [startDate, setStartDate] = useState('2025-09-01')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [endDate, setEndDate] = useState('2025-09-30')
  useEffect(() => {
    const loadInitialData = async () => {
      await dispatch(fetchJournalData({ start_date: startDate, end_date: endDate }))
      setIsInitialLoad(false)
    }

    loadInitialData()
  }, [dispatch])
  console.log(data)

  const statusData = [
    { label: 'Периоды по умолчанию', value: 0 },
    { label: 'Периоды по дням', value: 5 },
    { label: 'выбрать период', value: 10 },
  ]
  const rowTitles = data?.directions.map((dir) => dir.name) || []
  const dates = [
    '01.01.2024',
    '02.01.2024',
    '03.01.2024',
    '04.01.2024',
    '05.01.2024',
    '06.01.2024',
    '07.01.2024',
    '08.01.2024',
    '09.01.2024',
    '10.01.2024',
  ]
  const [status, setStatus] = useState(statusData[0].value)

  const generateData = () => {
    return Array.from({ length: rowTitles?.length }, () =>
      Array.from({ length: dates.length }, () => Math.floor(Math.random() * 1000))
    )
  }

  const [tableData, setTableData] = React.useState(generateData())
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

  const FIXED_COLUMN_WIDTH = 120
  const DATA_COLUMN_WIDTH = 100

  const horizontalScrollRef = useRef(null)
  const datesHorizontalScrollRef = useRef(null)
  const verticalScrollRef = useRef(null)
  const fixedColumnScrollRef = useRef(null)

  const isScrolling = useRef(false)
  const totalDataWidth = DATA_COLUMN_WIDTH * dates.length

  // Синхронизация горизонтальной прокрутки
  const handleHorizontalScroll = (event) => {
    if (isScrolling.current) return

    const offsetX = event.nativeEvent.contentOffset.x
    isScrolling.current = true

    // Синхронизируем заголовки дат
    if (datesHorizontalScrollRef.current) {
      datesHorizontalScrollRef.current.scrollTo({ x: offsetX, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  // Синхронизация горизонтальной прокрутки заголовков дат
  const handleDatesHorizontalScroll = (event) => {
    if (isScrolling.current) return

    const offsetX = event.nativeEvent.contentOffset.x
    isScrolling.current = true

    // Синхронизируем данные
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({ x: offsetX, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  // Синхронизация вертикальной прокрутки
  const handleVerticalScroll = (event) => {
    if (isScrolling.current) return

    const offsetY = event.nativeEvent.contentOffset.y
    isScrolling.current = true

    // Синхронизируем фиксированный столбец
    if (fixedColumnScrollRef.current) {
      fixedColumnScrollRef.current.scrollTo({ y: offsetY, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  // Синхронизация прокрутки фиксированного столбца
  const handleFixedColumnScroll = (event) => {
    if (isScrolling.current) return

    const offsetY = event.nativeEvent.contentOffset.y
    isScrolling.current = true

    // Синхронизируем основную таблицу
    if (verticalScrollRef.current) {
      verticalScrollRef.current.scrollTo({ y: offsetY, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  const openModal = (value, rowIndex, cellIndex) => {
    setSelectedCell({
      value,
      product: rowTitles[rowIndex],
      date: dates[cellIndex],
      coordinates: `[${rowIndex}, ${cellIndex}]`,
    })
    setIsModalVisible(true)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setSelectedCell(null)
  }

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <DropdownForJournal />
        <DropdownForJournal />
      </View>

      {/* ОСНОВНОЙ КОНТЕЙНЕР ТАБЛИЦЫ */}
      <View style={styles.tableContainer}>
        {/* ФИКСИРОВАННЫЙ ЛЕВЫЙ СТОЛБЕЦ */}
        <View style={styles.fixedColumn}>
          {/* Заголовок фиксированного столбца */}
          <View style={[styles.fixedHeader, { width: FIXED_COLUMN_WIDTH }]}>
            <Text style={styles.headerText}>Название</Text>
          </View>

          {/* Фиксированные названия строк */}
          <ScrollView
            ref={fixedColumnScrollRef}
            style={styles.fixedRows}
            showsVerticalScrollIndicator={false}
            onScroll={handleFixedColumnScroll}
            scrollEventThrottle={16}
          >
            {rowTitles.map((title, index) => (
              <View key={index} style={[styles.fixedCell, { width: FIXED_COLUMN_WIDTH }]}>
                <Text style={styles.cellText}>{title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ОСНОВНАЯ ПРОКРУЧИВАЕМАЯ ЧАСТЬ */}
        <View style={styles.mainContent}>
          {/* ФИКСИРОВАННЫЙ ВЕРХНИЙ РЯД С ДАТАМИ */}
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
                    <Text style={styles.headerText}>{date}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ПРОКРУЧИВАЕМЫЕ ДАННЫЕ */}
          <ScrollView
            ref={verticalScrollRef}
            style={styles.mainScroll}
            showsVerticalScrollIndicator={true}
            onScroll={handleVerticalScroll}
            scrollEventThrottle={16}
          >
            {/* ГОРИЗОНТАЛЬНЫЙ SCROLLVIEW ДЛЯ ДАННЫХ */}
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              onScroll={handleHorizontalScroll}
              scrollEventThrottle={16}
            >
              {/* КОНТЕЙНЕР ДЛЯ ДАННЫХ */}
              <View style={[styles.dataContent, { width: totalDataWidth }]}>
                {/* ДАННЫЕ ТАБЛИЦЫ */}
                <View style={styles.dataContainer}>
                  {tableData.map((rowData, rowIndex) => (
                    <View key={rowIndex} style={styles.dataRow}>
                      {rowData.map((value, cellIndex) => (
                        <View
                          key={cellIndex}
                          style={[styles.dataCell, { width: DATA_COLUMN_WIDTH }]}
                        >
                          <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => openModal(value, rowIndex, cellIndex)}
                          >
                            <Text style={styles.modalButtonText}>ⓘ</Text>
                          </TouchableOpacity>
                          <Text style={styles.cellText}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      </View>

      {/* Модальное окно */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Информация о ячейке</Text>

            {selectedCell && (
              <>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Продукт: </Text>
                  {selectedCell.product}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Дата: </Text>
                  {selectedCell.date}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Значение: </Text>
                  {selectedCell.value}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Координаты: </Text>
                  {selectedCell.coordinates}
                </Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Закрыть</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={closeModal}>
                <Text style={styles.confirmButtonText}>ОК</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  tableContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  fixedColumn: {
    width: 120,
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
    height: 50,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  fixedDatesHeader: {
    height: 50,
    backgroundColor: '#fff',
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
    backgroundColor: '#f0f0f0',
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
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataCell: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    position: 'relative',
  },
  modalButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    zIndex: 1,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Стили для модального окна
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.8,
    minHeight: SCREEN_HEIGHT * 0.3,
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
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  modalLabel: {
    fontWeight: '600',
    color: '#555',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  confirmButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
})

export default JournalScreen
