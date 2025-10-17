import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import DateTimePicker from 'react-native-modal-datetime-picker'
import { fetchJournalData } from '../../../redux/slises/generalStudentJournalSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { setSelectedPeriod } from '../../../redux/slises/periodSlice'
import { fetchDirectionGroupWithReplacement } from '../../../redux/slises/directionGroupSlice'
import { fetchUserDirections } from '../../../redux/slises/userDirectionsSlice'
import { hasRole } from '../../../settings/helpers'
import { fetchTeacherJournalData } from '../../../redux/slises/teacherJournalSlice'

interface DropdownItem {
  label: string
  value: string | number | null
  direction?: any
}

interface DropdownForJournalProps {
  data: DropdownItem[]
  value: string | number | null
  onValueChange: (item: DropdownItem) => void
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
}

const DropdownForJournal: React.FC<DropdownForJournalProps> = ({
  data,
  value,
  disabled,
  onValueChange,
  placeholder,
  searchable = false,
}) => {
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      search={searchable}
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

interface JournalHeaderProps {
  selectedDirection: number | null
  selectedGroup: number | null
  onDirectionChange: (directionId: number) => void
  onGroupChange: (groupId: number) => void
  isGroupDropdownDisabled: boolean
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  selectedDirection,
  selectedGroup,
  onDirectionChange,
  onGroupChange,
  isGroupDropdownDisabled,
}) => {
  const dispatch = useAppDispatch()
  const { periods, selectedPeriod } = useAppSelector((state) => state.periods)
  const { user } = useAppSelector((state) => state.user)
  const { directionGroups, loading: directionGroupsLoading } = useAppSelector(
    (state) => state.directionGroup
  )

  const isStudent = user ? hasRole(user, 'children') : false
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
  const isSeminarian = user ? hasRole(user, 'seminarian') : false
  const {
    userDirections,
    loading: userDirectionsloading,
    error,
  } = useAppSelector((state) => state.userDirections)

  console.log(userDirections, 'userDirectionsuserDirectionsuserDirectionsuserDirections')
  console.log(directionGroups, 'directionGroupsdirectionGroups')

  const firstDropdownData = [
    { label: 'Периоды по умолчанию', value: 'default' },
    { label: 'Периоды по дням', value: 'daily' },
    { label: 'Выбрать период', value: 'custom' },
  ]

  // Исправляем интерфейс DropdownItem
  interface ExtendedDropdownItem extends DropdownItem {
    direction?: any
    direction_id?: number
  }

  const subjectsData: ExtendedDropdownItem[] = userDirections.map((userDirection) => ({
    label: userDirection.direction.name,
    value: userDirection.direction_id,
    direction: userDirection.direction,
  }))

  const uniqueSubjectsData: ExtendedDropdownItem[] = userDirections.reduce((acc, userDirection) => {
    const directionName = userDirection.direction.name
    if (!acc.find((item) => item.label === directionName)) {
      acc.push({
        label: directionName,
        value: userDirection.direction_id,
        direction: userDirection.direction,
      })
    }
    return acc
  }, [] as ExtendedDropdownItem[])

  const directionGroupsData: ExtendedDropdownItem[] =
    directionGroups && Array.isArray(directionGroups)
      ? directionGroups.map((group) => ({
          label: group.name,
          value: group.value,
          direction_id: group.direction_id,
        }))
      : []

  const dataForDropDown = periods.map((period) => ({
    label: period.name,
    value: period.id,
  }))

  const handleFirstDropdownChange = (item: DropdownItem) => {
    setFirstDropdownValue(item.value as 'default' | 'daily' | 'custom')
    setSecondDropdownValue(null)
  }
  const handlePeriodChange = (startDate: string, endDate: string) => {
    // Только устанавливаем период, данные загрузятся в JournalScreen
    const customPeriod = {
      id: -1,
      name: 'Кастомный период',
      start_date: startDate,
      end_date: endDate,
    }
    dispatch(setSelectedPeriod(customPeriod))
  }
  useEffect(() => {
    if (user) {
      dispatch(fetchDirectionGroupWithReplacement(user.id))
      dispatch(fetchUserDirections(user.id))
    }
    if (periods.length > 0 && firstDropdownValue === 'default' && !secondDropdownValue) {
      const firstPeriod = periods[0]
      setSecondDropdownValue(firstPeriod.id)
      dispatch(setSelectedPeriod(firstPeriod))
      handlePeriodChange(firstPeriod.start_date, firstPeriod.end_date) // ← ИСПОЛЬЗУЕМ ФУНКЦИЮ
    }
  }, [periods, firstDropdownValue, secondDropdownValue, dispatch, user])

  const handleSecondDropdownChange = (item: DropdownItem) => {
    const currentPeriod = periods.find((data) => data.id === item.value)

    if (currentPeriod) {
      dispatch(setSelectedPeriod(currentPeriod))
      setSecondDropdownValue(item.value as number)
      handlePeriodChange(currentPeriod.start_date, currentPeriod.end_date) // ← ИСПОЛЬЗУЕМ ФУНКЦИЮ
    }
  }

  const handleSubjectChange = (item: ExtendedDropdownItem) => {
    onDirectionChange(item.value as number)
  }

  const handleDirectionGroupChange = (item: ExtendedDropdownItem) => {
    onGroupChange(item.value as number)
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

    handlePeriodChange(dateStr, dateStr) // ← ИСПОЛЬЗУЕМ ФУНКЦИЮ
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

    handlePeriodChange(startDate, endDate) // ← ИСПОЛЬЗУЕМ ФУНКЦИЮ
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
              disabled={isGroupDropdownDisabled}
            />
          </View>
          <View style={styles.dropdownWrapper}>{renderSecondDropdown()}</View>
        </View>
        {isSeminarian && (
          <View style={{ width: '100%', flexDirection: 'row', marginTop: 10 }}>
            <View style={styles.dropdownWrapper}>
              {userDirectionsloading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#6E368C" />
                  <Text style={styles.loadingText}>Загрузка предметов...</Text>
                </View>
              ) : subjectsData.length > 0 ? (
                <DropdownForJournal
                  data={subjectsData}
                  value={selectedDirection}
                  onValueChange={handleSubjectChange}
                  placeholder="Выберите предмет"
                  searchable={true}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>Нет доступных предметов</Text>
                </View>
              )}
            </View>
            <View style={styles.dropdownWrapper}>
              {directionGroupsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#6E368C" />
                  <Text style={styles.loadingText}>Загрузка групп...</Text>
                </View>
              ) : directionGroupsData.length > 0 ? (
                <DropdownForJournal
                  data={directionGroupsData}
                  value={selectedGroup} // Используем переданный пропс
                  onValueChange={handleDirectionGroupChange}
                  placeholder="Выберите группу"
                  searchable={true}
                  disabled={isGroupDropdownDisabled} // Добавляем disabled
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>Нет доступных групп</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Восстановленная модалка для выбора периода */}
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

      {/* Date Pickers */}
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
  loadingContainer: {
    height: 50,
    borderColor: '#6E368C',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
})

export default JournalHeader
