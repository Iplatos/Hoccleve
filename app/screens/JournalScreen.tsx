import React, { useRef, useState } from 'react'
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { DropdownComponent } from '../components/DropdownComponent/DropdownComponent'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export const JournalScreen = () => {
  const statusData = [
    { label: 'Периоды по умолчанию', value: 0 },
    { label: 'Периоды по дням', value: 5 },
    { label: 'выбрать период', value: 10 },
  ]
  const rowTitles = [
    'Продукт A',
    'Продукт B',
    'Продукт C',
    'Продукт D',
    'Продукт E',
    'Продукт F',
    'Продукт G',
    'Продукт H',
    'Продукт I',
    'Продукт J',
  ]
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
    return Array.from({ length: rowTitles.length }, () =>
      Array.from({ length: dates.length }, () => Math.floor(Math.random() * 1000))
    )
  }
  const [tempType, setTempType] = useState<
    'Периоды по умолчанию' | 'Периоды по дням' | 'выбрать период'
  >('Периоды по умолчанию')
  const [tableData, setTableData] = React.useState(generateData())
  const [isModalVisible, setIsModalVisible] = useState(false)

  const FIXED_COLUMN_WIDTH = 120
  const DATA_COLUMN_WIDTH = 100

  const horizontalScrollRef = useRef(null)
  const verticalDataScrollRef = useRef(null)
  const verticalFixedScrollRef = useRef(null)

  const isScrolling = useRef(false)
  const totalDataWidth = DATA_COLUMN_WIDTH * dates.length

  // Обработчик вертикальной прокрутки данных
  const handleVerticalDataScroll = (event) => {
    if (isScrolling.current) return

    const offsetY = event.nativeEvent.contentOffset.y
    isScrolling.current = true

    if (verticalFixedScrollRef.current) {
      verticalFixedScrollRef.current.scrollTo({ y: offsetY, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  // Обработчик вертикальной прокрутки фиксированного столбца
  const handleVerticalFixedScroll = (event) => {
    if (isScrolling.current) return

    const offsetY = event.nativeEvent.contentOffset.y
    isScrolling.current = true

    if (verticalDataScrollRef.current) {
      verticalDataScrollRef.current.scrollTo({ y: offsetY, animated: false })
    }

    setTimeout(() => {
      isScrolling.current = false
    }, 10)
  }

  // Рендер строки данных
  const renderDataRow = ({ item, index }) => (
    <View style={styles.dataRow}>
      {item.map((value, cellIndex) => (
        <View key={cellIndex} style={[styles.dataCell, { width: DATA_COLUMN_WIDTH }]}>
          <TouchableOpacity style={styles.modalButton} onPress={openModal}>
            <Text style={styles.modalButtonText}>ⓘ</Text>
          </TouchableOpacity>
          <Text style={styles.cellText}>{value}</Text>
        </View>
      ))}
    </View>
  )

  const openModal = () => setIsModalVisible(true)
  const closeModal = () => setIsModalVisible(false)
  //   const [homeworkType, setHomeworkType] = useState<WorkType>('homework')
  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: 'red' }}>
        <DropdownComponent setStatus={setStatus} setHomeworkType={setTempType} totalCount={3} />
        <Text>asdad</Text>
      </View>
      <View style={styles.tableContainer}>
        {/* ФИКСИРОВАННЫЙ ЛЕВЫЙ СТОЛБЕЦ */}
        <View style={styles.fixedColumn}>
          <View style={[styles.fixedHeader, { width: FIXED_COLUMN_WIDTH }]}>
            <Text style={styles.headerText}>Название</Text>
          </View>

          <ScrollView
            ref={verticalFixedScrollRef}
            style={styles.fixedRows}
            showsVerticalScrollIndicator={false}
            onScroll={handleVerticalFixedScroll}
            scrollEventThrottle={16}
          >
            {rowTitles.map((title, index) => (
              <View key={index} style={[styles.fixedCell, { width: FIXED_COLUMN_WIDTH }]}>
                <Text style={styles.cellText}>{title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ПРОКРУЧИВАЕМАЯ ЧАСТЬ */}
        <View style={styles.scrollablePart}>
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScroll}
          >
            <View style={[styles.rightPartContainer, { width: totalDataWidth }]}>
              {/* ЗАГОЛОВКИ ДАТ */}
              <View style={styles.datesHeader}>
                {dates.map((date, index) => (
                  <View key={index} style={[styles.dateHeader, { width: DATA_COLUMN_WIDTH }]}>
                    <Text style={styles.headerText}>{date}</Text>
                  </View>
                ))}
              </View>

              {/* ДАННЫЕ ТАБЛИЦЫ - используем FlatList вместо ScrollView */}
              <FlatList
                ref={verticalDataScrollRef}
                data={tableData}
                renderItem={renderDataRow}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={true}
                onScroll={handleVerticalDataScroll}
                scrollEventThrottle={16}
                style={styles.dataFlatList}
              />
            </View>
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
            <Text style={styles.modalTitle}>Информация</Text>
            <Text style={styles.modalText}>
              Это модальное окно занимает 30% ширины и 33% высоты экрана
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Отмена</Text>
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
  modalButton: { position: 'absolute', right: 10, top: 1 },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    zIndex: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  selectedValue: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
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
  scrollablePart: {
    flex: 1,
  },
  horizontalScroll: {
    flex: 1,
  },
  rightPartContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  datesHeader: {
    height: 50,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  dateHeader: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  dataFlatList: {
    flex: 1,
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
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_HEIGHT * 0.33,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
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
