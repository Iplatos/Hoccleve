import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import DateTimePicker from 'react-native-modal-datetime-picker'
import { fetchJournalData } from '../../../redux/slises/generalStudentJournalSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'

interface DropdownItem {
  label: string
  value: string | number | null
}

interface DropdownForJournalProps {
  data: DropdownItem[]
  value: string | number | null
  onValueChange: (item: DropdownItem) => void
  placeholder?: string
}

const DropdownForJournal: React.FC<DropdownForJournalProps> = ({
  data,
  value,
  onValueChange,
  placeholder,
}) => {
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
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
  >(null)
  const [secondDropdownValue, setSecondDropdownValue] = useState(null)
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [datePickerMode, setDatePickerMode] = useState('start') // 'start' or 'end'

  const firstDropdownData = [
    { label: 'Периоды по умолчанию', value: 'default' },
    { label: 'Периоды по дням', value: 'daily' },
    { label: 'Выбрать период', value: 'custom' },
  ]

  const periodData = periods.map((period) => ({
    label: period.name,
    value: period.id,
    ...period,
  }))

  const handleFirstDropdownChange = (item) => {
    setFirstDropdownValue(item.value)
    setSecondDropdownValue(null)
  }

  const handleSecondDropdownChange = (item) => {
    setSecondDropdownValue(item.value)

    const selectedPeriod = periods.find((p) => p.id === item.value)
    if (selectedPeriod) {
      dispatch(
        fetchJournalData({
          start_date: selectedPeriod.start_date,
          end_date: selectedPeriod.end_date,
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
        return (
          <DropdownForJournal
            data={periodData}
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

  return (
    <View style={styles.container}>
      <View style={styles.dropdownWrapper}>
        <DropdownForJournal
          data={firstDropdownData}
          value={firstDropdownValue}
          onValueChange={handleFirstDropdownChange}
          placeholder="Тип периода"
        />
      </View>

      <View style={styles.dropdownWrapper}>{renderSecondDropdown()}</View>

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

      {/* Date Picker для периода */}
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
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
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
    fontSize: 14,
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
