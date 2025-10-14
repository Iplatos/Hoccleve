import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, ToastAndroid, Platform, Alert } from 'react-native'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchJournalData } from '../redux/slises/generalStudentJournalSlice'
import { fetchTeacherJournalData } from '../redux/slises/teacherJournalSlice'
import { fetchPeriods, setSelectedPeriod } from '../redux/slises/periodSlice'
import { getSortByField, getUnionDate, hasRole, removeDuplicates } from '../settings/helpers'

import { JournalStudentTable } from '../components/JournalStudentTable/JournalStudentTable'
import { JournalStudentModal } from '../components/JournalStudentModal/JournalStudentModal'
import JournalHeader from '../components/DropdownComponent/DropdownForJournal/DropdownForJournal'
import { JournalTeacherTable } from '../components/JournalTeacherTable/JournalTeacherTable'
import { JournalTeacherModal } from '../components/JournalTeacherModal/JournalTeacherModal'

export const JournalScreen = () => {
  const dispatch = useAppDispatch()
  const {
    data: studentData,
    loading: studentLoading,
    error: studentError,
  } = useAppSelector((state) => state.generalStudentJournal)

  const {
    data: teacherData,
    loading: teacherLoading,
    error: teacherError,
  } = useAppSelector((state) => state.teacherJournal)

  const { periods, loading: periodsLoading } = useAppSelector((state) => state.periods)
  const { userDirections } = useAppSelector((state) => state.userDirections)
  const { directionGroups } = useAppSelector((state) => state.directionGroup)

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)

  const user = useAppSelector((state) => state.user.user)

  const isSeminarian = user ? hasRole(user, 'seminarian') : false
  const isStudent = user ? hasRole(user, 'children') : false

  // Функция для показа Toast
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
    } else {
      Alert.alert('Внимание', message)
    }
  }

  // Обработчик выбора направления
  const handleDirectionChange = (directionId: number) => {
    setSelectedDirection(directionId)
    setSelectedGroup(null) // Сбрасываем выбранную группу при смене направления
    showToast('Направление выбрано. Теперь выберите группу.')
  }

  // Обработчик выбора группы
  const handleGroupChange = (groupId: number) => {
    if (!selectedDirection) {
      showToast('Сначала выберите направление')
      return
    }
    setSelectedGroup(groupId)

    // Делаем запрос за учениками при выборе группы
    if (selectedPeriod) {
      dispatch(
        fetchTeacherJournalData({
          start_date: selectedPeriod.start_date,
          end_date: selectedPeriod.end_date,
          type: 'group',
          direction: selectedDirection,
          groups: groupId,
        })
      )
    }
  }

  // Блокировка dropdown групп если не выбрано направление
  const isGroupDropdownDisabled = !selectedDirection

  const handleSaveTeacherData = (saveData: any) => {
    console.log('Saving teacher data:', saveData)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const periodsData = await dispatch(fetchPeriods()).unwrap()
        let targetPeriod = null

        if (periodsData && periodsData.length > 0) {
          targetPeriod = periodsData[0]
          dispatch(setSelectedPeriod(targetPeriod))
        } else {
          const endDate = new Date().toISOString().split('T')[0]
          const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
          targetPeriod = {
            id: -1,
            name: 'Последняя неделя',
            start_date: startDate,
            end_date: endDate,
          }
          dispatch(setSelectedPeriod(targetPeriod))
        }

        // Для семинариста загружаем данные только если выбраны направление и группа
        if (isStudent) {
          await dispatch(
            fetchJournalData({
              start_date: targetPeriod.start_date,
              end_date: targetPeriod.end_date,
            })
          ).unwrap()
        }
        // Для семинариста данные загрузим позже, когда выберут направление и группу
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsInitialLoad(false)
      }
    }

    loadInitialData()
  }, [dispatch, isSeminarian, isStudent])

  // Получаем выбранный период из Redux
  const selectedPeriod = useAppSelector((state) => state.periods.selectedPeriod)

  const data = isSeminarian ? teacherData : studentData
  const loading = isSeminarian ? teacherLoading : studentLoading

  const saveGradeAndComment = () => {
    console.log('save')
  }

  const getTableData = () => {
    if (isSeminarian && teacherData) {
      return {
        dates: teacherData.dates || [],
        children: teacherData.children || [],
      }
    } else if (isStudent && studentData) {
      const validData =
        studentData !== null && studentData !== undefined
          ? studentData
          : { directions: [], dates: [] }

      return {
        dates:
          validData.dates && validData.dates.length > 0
            ? getUnionDate(removeDuplicates(validData.dates)).slice().sort(getSortByField('date'))
            : [],
        directions: validData.directions || [],
      }
    }

    return { dates: [], directions: [], children: [] }
  }

  const tableData = getTableData()

  const openModal = (item, date, lessonData) => {
    if (isSeminarian) {
      setSelectedCell({
        student: item.name,
        date: date.date,
        lesson: lessonData,
        grades: lessonData?.grades || [],
        status: lessonData?.status || '',
      })
    } else {
      setSelectedCell({
        direction: item.name,
        date: date.date,
        lesson: lessonData,
        topic: lessonData?.topic || '',
      })
    }
    setIsModalVisible(true)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setSelectedCell(null)
  }

  const renderTable = () => {
    // Для семинариста показываем таблицу только если есть данные
    if (isSeminarian) {
      // Добавляем проверку на существование teacherData и его свойств
      if (!teacherData || !teacherData.children || teacherData.children.length === 0) {
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              {selectedDirection && selectedGroup
                ? 'Загрузка данных...'
                : 'Выберите направление и группу для отображения журнала'}
            </Text>
          </View>
        )
      }
      return (
        <JournalTeacherTable data={tableData} dates={tableData.dates} onCellPress={openModal} />
      )
    } else if (isStudent) {
      // Также добавляем проверку для студента
      if (!studentData || !studentData.directions || studentData.directions.length === 0) {
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>Нет данных для отображения</Text>
          </View>
        )
      }
      return (
        <JournalStudentTable data={tableData} dates={tableData.dates} onCellPress={openModal} />
      )
    } else {
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Таблица не доступна для вашей роли</Text>
        </View>
      )
    }
  }

  // Передаем обработчики в JournalHeader
  const journalHeaderProps = {
    selectedDirection,
    selectedGroup,
    onDirectionChange: handleDirectionChange,
    onGroupChange: handleGroupChange,
    isGroupDropdownDisabled,
  }

  if (isInitialLoad || periodsLoading) {
    return <Text>Loading</Text>
  }

  if (!isSeminarian && (!studentData || !studentData.directions)) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Нет данных для отображения</Text>
      </View>
    )
  }
  if (loading) {
    return <Text>Loadingi</Text>
  }
  return (
    <ScrollView style={styles.container}>
      <JournalHeader {...journalHeaderProps} />
      {renderTable()}
      {isSeminarian ? (
        <JournalTeacherModal
          visible={isModalVisible}
          selectedCell={selectedCell}
          onClose={closeModal}
          onSave={saveGradeAndComment}
        />
      ) : (
        <JournalStudentModal
          visible={isModalVisible}
          selectedCell={selectedCell}
          onClose={closeModal}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})
