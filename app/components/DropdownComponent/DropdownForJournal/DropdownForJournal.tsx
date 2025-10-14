import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, TextInput } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import DateTimePicker from 'react-native-modal-datetime-picker'
import { fetchJournalData } from '../../../redux/slises/generalStudentJournalSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { setSelectedPeriod } from '../../../redux/slises/periodSlice'

interface DropdownItem {
  label: string
  value: string | number | null
}

interface DropdownForJournalProps {
  data: DropdownItem[]
  value: string | number | null
  onValueChange: (item: DropdownItem) => void
  placeholder?: string
  searchable?: boolean // Новый проп
}

const DropdownForJournal: React.FC<DropdownForJournalProps> = ({
  data,
  value,
  onValueChange,
  placeholder,
  searchable = false, // По умолчанию false
}) => {
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      search={searchable} // Включаем поиск
      searchPlaceholder="Поиск..."
      maxHeight={300}
      labelField="label"
      activeColor="#6E368C"
      valueField="value"
      placeholder={placeholder}
      value={value}
      onChange={onValueChange}
    />
  )
}

export const JournalHeader = () => {
  const dispatch = useAppDispatch()
  const { periods } = useAppSelector((state) => state.periods)

  const [firstDropdownValue, setFirstDropdownValue] = useState<
    'default' | 'daily' | 'custom' | null
  >('default')
  const [secondDropdownValue, setSecondDropdownValue] = useState<number | null>(null)
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [datePickerMode, setDatePickerMode] = useState('start')
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const firstDropdownData = [
    { label: 'Периоды по умолчанию', value: 'default' },
    { label: 'Периоды по дням', value: 'daily' },
    { label: 'Выбрать период', value: 'custom' },
  ]

  const dataForDropDown = periods.map((period) => ({
    label: period.name,
    value: period.id,
  }))

  const handleFirstDropdownChange = (item) => {
    setFirstDropdownValue(item.value)
    setSecondDropdownValue(null)
  }

  useEffect(() => {
    if (periods.length > 0 && firstDropdownValue === 'default' && !secondDropdownValue) {
      const firstPeriod = periods[0]
      setSecondDropdownValue(firstPeriod.id)
      dispatch(setSelectedPeriod(firstPeriod))
      dispatch(
        fetchJournalData({
          start_date: firstPeriod.start_date,
          end_date: firstPeriod.end_date,
        })
      )
    }
  }, [periods, firstDropdownValue, secondDropdownValue, dispatch])

  const handleSecondDropdownChange = (item: DropdownItem) => {
    const currentPeriod = periods.find((data) => data.id === item.value)
    console.log(currentPeriod)

    if (currentPeriod) {
      dispatch(setSelectedPeriod(currentPeriod))
      setSecondDropdownValue(item.value as number)

      dispatch(
        fetchJournalData({
          start_date: currentPeriod.start_date,
          end_date: currentPeriod.end_date,
        })
      )
    }
  }

  const handleDailyDateSelect = () => {
    setIsDatePickerVisible(true)
  }

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date)
    setIsDatePickerVisible(false)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    dispatch(
      fetchJournalData({
        start_date: dateStr,
        end_date: dateStr,
      })
    )
  }

  const handleCustomPeriodSelect = () => {
    setIsPeriodModalVisible(true)
  }

  const handleStartDateSelect = () => {
    setDatePickerMode('start')
    setIsDatePickerVisible(true)
  }

  const handleEndDateSelect = () => {
    setDatePickerMode('end')
    setIsDatePickerVisible(true)
  }

  const handlePeriodDateConfirm = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    if (datePickerMode === 'start') {
      setStartDate(dateStr)
    } else {
      setEndDate(dateStr)
    }
    setIsDatePickerVisible(false)
  }

  const handleApplyPeriod = () => {
    if (!startDate || !endDate) {
      Alert.alert('Ошибка', 'Выберите обе даты')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Ошибка', 'Дата начала не может быть позже даты окончания')
      return
    }

    dispatch(
      fetchJournalData({
        start_date: startDate,
        end_date: endDate,
      })
    )
    setIsPeriodModalVisible(false)
    setStartDate(null)
    setEndDate(null)
  }

  const renderSecondDropdown = () => {
    switch (firstDropdownValue) {
      case 'default':
        if (dataForDropDown.length === 0) {
          return (
            <View style={styles.noPeriodsContainer}>
              <Text style={styles.noPeriodsText}>Нет периодов по умолчанию</Text>
            </View>
          )
        }
        return (
          <DropdownForJournal
            data={dataForDropDown}
            value={secondDropdownValue}
            onValueChange={handleSecondDropdownChange}
            placeholder="Выберите четверть"
          />
        )
      case 'daily':
        return (
          <TouchableOpacity style={styles.dateButton} onPress={handleDailyDateSelect}>
            <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString('ru-RU')}</Text>
          </TouchableOpacity>
        )
      case 'custom':
        return (
          <TouchableOpacity style={styles.dateButton} onPress={handleCustomPeriodSelect}>
            <Text style={styles.dateButtonText}>Дата/период</Text>
          </TouchableOpacity>
        )
      default:
        return null
    }
  }
  const subjectsData = [
    { label: 'Русский язык', value: 1 },
    { label: 'Русская литература', value: 2 },
    { label: 'Математика', value: 3 },
    { label: 'Физика', value: 4 },
    { label: 'Химия', value: 5 },
    { label: 'Биология', value: 6 },
    { label: 'История', value: 7 },
    { label: 'Обществознание', value: 8 },
    { label: 'География', value: 9 },
    { label: 'Английский язык', value: 10 },
    { label: 'Информатика', value: 11 },
  ]
  const handleSubjectChange = (item: DropdownItem) => {
    setSelectedSubject(item.value as number)
    // Здесь можно добавить логику для загрузки данных по предмету
    console.log('Выбран предмет:', item)
  }
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'column', width: '100%' }}>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <View style={styles.dropdownWrapper}>
            <DropdownForJournal
              data={firstDropdownData}
              value={firstDropdownValue}
              onValueChange={handleFirstDropdownChange}
              placeholder="Тип периода"
            />
          </View>
          <View style={styles.dropdownWrapper}>{renderSecondDropdown()}</View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <View style={styles.dropdownWrapper}>
            <DropdownForJournal
              data={subjectsData}
              value={selectedSubject}
              onValueChange={handleSubjectChange}
              placeholder="Выберите предмет"
              searchable={true}
            />
          </View>
          <View style={styles.dropdownWrapper}>
            <DropdownForJournal
              data={firstDropdownData}
              value={firstDropdownValue}
              onValueChange={handleFirstDropdownChange}
              placeholder="Тип периода"
            />
          </View>
        </View>
      </View>

      {/* Date Picker для дней */}
      <DateTimePicker
        isVisible={isDatePickerVisible && firstDropdownValue === 'daily'}
        mode="date"
        date={selectedDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setIsDatePickerVisible(false)}
        locale="ru_RU"
        cancelTextIOS="Отмена"
        confirmTextIOS="OK"
      />

      <DateTimePicker
        isVisible={isDatePickerVisible && firstDropdownValue === 'custom'}
        mode="date"
        date={
          datePickerMode === 'start' && startDate
            ? new Date(startDate)
            : datePickerMode === 'end' && endDate
            ? new Date(endDate)
            : new Date()
        }
        onConfirm={handlePeriodDateConfirm}
        onCancel={() => setIsDatePickerVisible(false)}
        locale="ru_RU"
        cancelTextIOS="Отмена"
        confirmTextIOS="OK"
      />

      <Modal
        visible={isPeriodModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPeriodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите период</Text>

            <View style={styles.periodButtons}>
              <TouchableOpacity style={styles.periodButton} onPress={handleStartDateSelect}>
                <Text style={styles.periodButtonText}>Начало: {startDate || 'Не выбрано'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.periodButton} onPress={handleEndDateSelect}>
                <Text style={styles.periodButtonText}>Конец: {endDate || 'Не выбрано'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.applyButton,
                (!startDate || !endDate || new Date(startDate) > new Date(endDate)) &&
                  styles.applyButtonDisabled,
              ]}
              onPress={handleApplyPeriod}
              disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate)}
            >
              <Text style={styles.applyButtonText}>Выбрать</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsPeriodModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    flexDirection: 'row',
    borderBottomColor: '#e0e0e0',
  },
  dropdownWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdown: {
    height: 50,
    borderColor: '#6E368C',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
  },

  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#6E368C',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dateButton: {
    height: 50,
    borderColor: '#6E368C',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
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
  },
  periodButtons: {
    marginBottom: 20,
  },
  periodButton: {
    height: 50,
    borderColor: '#6E368C',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    marginBottom: 10,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#6E368C',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noPeriodsContainer: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPeriodsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  weekInfoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
  },
})

export default JournalHeader
