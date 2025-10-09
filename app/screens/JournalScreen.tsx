import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchJournalData } from '../redux/slises/generalStudentJournalSlice'
import { fetchTeacherJournalData } from '../redux/slises/teacherJournalSlice' // ✅ ДОБАВИЛ
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
  } = useAppSelector((state) => state.teacherJournal) // ✅ ДОБАВИЛ

  const { periods, loading: periodsLoading } = useAppSelector((state) => state.periods)
  console.log(teacherData)

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)
  const user = useAppSelector((state) => state.user.user)

  const isSeminarian = user ? hasRole(user, 'seminarian') : false
  const isStudent = user ? hasRole(user, 'children') : false
  const handleSaveTeacherData = (saveData: any) => {
    // Здесь будет логика сохранения данных через API
    console.log('Saving teacher data:', saveData)
    // dispatch(updateStudentGrade(saveData))
  }
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const periodsData = await dispatch(fetchPeriods()).unwrap()
        let targetPeriod = null

        if (periodsData && periodsData.length > 0) {
          targetPeriod = periodsData[0]
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
        }

        dispatch(setSelectedPeriod(targetPeriod))

        if (isSeminarian) {
          await dispatch(
            fetchTeacherJournalData({
              start_date: targetPeriod.start_date,
              end_date: targetPeriod.end_date,
              type: 'group',
              direction: 1,
              groups: 525,
            })
          ).unwrap()
        } else if (isStudent) {
          await dispatch(
            fetchJournalData({
              start_date: targetPeriod.start_date,
              end_date: targetPeriod.end_date,
            })
          ).unwrap()
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsInitialLoad(false)
      }
    }

    loadInitialData()
  }, [dispatch, isSeminarian, isStudent])

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
      // Для ученика - оставляем как было
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
    if (isSeminarian) {
      return (
        <JournalTeacherTable data={tableData} dates={tableData.dates} onCellPress={openModal} />
      )
    } else if (isStudent) {
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

  if (isInitialLoad || periodsLoading || loading) {
    return <Text>Loading</Text>
  }

  if (!data) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Нет данных для отображения</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <JournalHeader />
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
