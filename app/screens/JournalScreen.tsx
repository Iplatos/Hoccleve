import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, ToastAndroid, Platform, Alert } from 'react-native'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { clearError, fetchJournalData } from '../redux/slises/generalStudentJournalSlice'
import { fetchTeacherJournalData } from '../redux/slises/teacherJournalSlice'
import { fetchPeriods, setSelectedPeriod } from '../redux/slises/periodSlice'
import { getSortByField, getUnionDate, hasRole, removeDuplicates } from '../settings/helpers'

import { JournalStudentTable } from '../components/JournalStudentTable/JournalStudentTable'
import { JournalStudentModal } from '../components/JournalStudentModal/JournalStudentModal'
import JournalHeader from '../components/DropdownComponent/DropdownForJournal/DropdownForJournal'
import { JournalTeacherTable } from '../components/JournalTeacherTable/JournalTeacherTable'
import { JournalTeacherModal } from '../components/JournalTeacherModal/JournalTeacherModal'
import { clearSuccess, editGrades } from '../redux/slises/editGradesSlice'

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

  const {
    periods,
    loading: periodsLoading,
    selectedPeriod,
  } = useAppSelector((state) => state.periods)
  const { userDirections } = useAppSelector((state) => state.userDirections)
  const { directionGroups } = useAppSelector((state) => state.directionGroup)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [newGrades, setNewGrades] = useState<any[]>([])

  const {
    loading: editGradesLoading,
    error: editGradesError,
    success: editGradesSuccess,
  } = useAppSelector((state) => state.editGrades)
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
    setSelectedGroup(null)
    showToast('Направление выбрано. Теперь выберите группу.')
  }

  // Обработчик выбора группы
  const handleGroupChange = (groupId: number) => {
    if (!selectedDirection) {
      showToast('Сначала выберите направление')
      return
    }
    setSelectedGroup(groupId)
  }

  // Загружаем периоды при монтировании
  useEffect(() => {
    dispatch(fetchPeriods())
  }, [dispatch])

  // Загружаем данные студента при загрузке периодов
  useEffect(() => {
    if (isStudent && selectedPeriod) {
      dispatch(
        fetchJournalData({
          start_date: selectedPeriod.start_date,
          end_date: selectedPeriod.end_date,
        })
      )
    }
  }, [isStudent, selectedPeriod, dispatch])

  // Загружаем данные семинариста при изменении группы или периода
  useEffect(() => {
    if (isSeminarian && selectedDirection && selectedGroup && selectedPeriod) {
      dispatch(
        fetchTeacherJournalData({
          start_date: selectedPeriod.start_date,
          end_date: selectedPeriod.end_date,
          type: 'group',
          direction: selectedDirection,
          groups: selectedGroup,
        })
      )
    }
  }, [isSeminarian, selectedDirection, selectedGroup, selectedPeriod, dispatch])

  // Функции для управления оценками
  const handleAddGrade = (newGrade: string, newGradeComment: string) => {
    if (!newGrade.trim()) {
      Alert.alert('Ошибка', 'Введите оценку')
      return
    }

    const gradeValue = parseInt(newGrade)

    const newGradeObj = {
      grade: gradeValue,
      weight: 1,
      comment: newGradeComment,
    }

    setNewGrades([...newGrades, newGradeObj])
  }

  const handleRemoveGrade = (gradeId: any) => {
    // Сначала проверяем, есть ли эта оценка в новых (несохраненных)
    const newGradeIndex = newGrades.findIndex((grade) => grade.id === gradeId)
    if (newGradeIndex !== -1) {
      // Удаляем новую оценку
      const updatedNewGrades = newGrades.filter((grade) => grade.id !== gradeId)
      setNewGrades(updatedNewGrades)
      showToast('Новая оценка удалена')
      return
    }

    // Если не нашли в новых, значит это существующая оценка
    const payload = {
      date_id: selectedCell?.fullDate.id,
      children_id: selectedCell?.studentData.id,
      status: selectedCell?.status || '',
      comment: selectedCell?.lesson?.comment || '',
      grades: selectedCell?.lesson?.grades?.filter((grade) => grade.id !== gradeId) || [],
    }

    console.log('Remove payload:', payload)

    dispatch(editGrades(payload))
      .unwrap()
      .then((response) => {
        console.log('Grade removed successfully:', response)
        showToast('Оценка удалена')

        // ОБНОВЛЯЕМ selectedCell чтобы модалка показала актуальные данные
        const updatedCell = {
          ...selectedCell,
          lesson: {
            ...selectedCell.lesson,
            grades: selectedCell?.lesson?.grades?.filter((grade) => grade.id !== gradeId) || [],
          },
        }
        setSelectedCell(updatedCell)

        // Перезагружаем данные таблицы (но модалку НЕ закрываем)
        if (selectedPeriod && selectedDirection && selectedGroup) {
          dispatch(
            fetchTeacherJournalData({
              start_date: selectedPeriod.start_date,
              end_date: selectedPeriod.end_date,
              type: 'group',
              direction: selectedDirection,
              groups: selectedGroup,
            })
          )
        }
      })
      .catch((error) => {
        console.error('Error removing grade:', error)
        showToast(`Ошибка при удалении: ${error}`)
      })
  }

  const handleSaveTeacherData = (
    newGradeFromModal: string,
    newGradeCommentFromModal: string,
    status: string,
    statusComment: string
  ) => {
    let finalGrades = [...newGrades]

    if (newGradeFromModal.trim()) {
      const gradeValue = parseInt(newGradeFromModal)
      const newGradeObj = {
        grade: gradeValue,
        weight: 1,
        comment: newGradeCommentFromModal,
      }
      finalGrades = [...newGrades, newGradeObj]
    }

    const allGrades = [...(selectedCell?.lesson?.grades || []), ...finalGrades]

    // СОЗДАЕМ PAYLOAD ОБЪЕКТ
    const payload = {
      date_id: selectedCell?.fullDate.id,
      children_id: selectedCell?.studentData.id,
      status: status || '',
      comment: statusComment || '',
      grades: allGrades.map((grade: any) => ({
        grade: grade.grade,
        weight: grade.weight,
        comment: grade.comment,
        id: grade.id,
      })),
    }

    console.log('Final payload:', payload)

    dispatch(editGrades(payload))
      .unwrap()
      .then((response) => {
        console.log('Grades saved successfully:', response)
        showToast('Оценки успешно сохранены')

        // Закрываем модалку и очищаем новые оценки
        closeModal()

        // Перезагружаем данные таблицы
        if (selectedPeriod && selectedDirection && selectedGroup) {
          dispatch(
            fetchTeacherJournalData({
              start_date: selectedPeriod.start_date,
              end_date: selectedPeriod.end_date,
              type: 'group',
              direction: selectedDirection,
              groups: selectedGroup,
            })
          )
        }
      })
      .catch((error) => {
        console.error('Error saving grades:', error)
        showToast(`Ошибка при сохранении: ${error}`)
      })
  }

  const openModal = (item, date, lessonData) => {
    console.log(item, 'itemitemitemitemitem')
    console.log(date, 'datadatadatadatadatadatadatadata')
    console.log(lessonData, 'lessonDatalessonDatalessonData')

    if (isSeminarian) {
      // Очищаем новые оценки при открытии модалки
      setNewGrades([])

      setSelectedCell({
        student: item.name,
        date: date.date,
        lesson: lessonData,
        grades: lessonData?.grades || [],
        status: lessonData?.status || '',
        studentData: item,
        fullDate: date,
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

    // Очищаем новые оценки при закрытии модалки
    setNewGrades([])
  }

  // Можно добавить эффект для автоматического закрытия модалки при успехе
  useEffect(() => {
    if (editGradesSuccess) {
      // Дополнительные действия при успешном сохранении
      dispatch(clearSuccess())
    }
  }, [editGradesSuccess, dispatch])

  // Очищаем ошибки при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearSuccess())
    }
  }, [dispatch])

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

  const renderTable = () => {
    if (isSeminarian) {
      if (teacherLoading) {
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>Загрузка данных журнала...</Text>
          </View>
        )
      }

      if (!teacherData || !teacherData.children || teacherData.children.length === 0) {
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              {selectedDirection && selectedGroup
                ? 'Нет данных для отображения'
                : 'Выберите направление и группу для отображения журнала'}
            </Text>
          </View>
        )
      }

      return (
        <JournalTeacherTable data={tableData} dates={tableData.dates} onCellPress={openModal} />
      )
    } else if (isStudent) {
      if (studentLoading) {
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>Загрузка данных журнала...</Text>
          </View>
        )
      }

      if (!studentData || !studentData.directions || studentData.directions.length === 0) {
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              {selectedPeriod ? 'Нет данных для отображения' : 'Период не выбран'}
            </Text>
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
    isGroupDropdownDisabled: !selectedDirection,
  }
  const handleUpdateGradeComment = (gradeId: number, comment: string) => {
    // Сначала проверяем, это новая оценка или существующая
    const isNewGrade = newGrades.some((grade) => grade.id === gradeId)

    if (isNewGrade) {
      // Обновляем комментарий новой оценки
      const updatedNewGrades = newGrades.map((grade) =>
        grade.id === gradeId ? { ...grade, comment } : grade
      )
      setNewGrades(updatedNewGrades)
    } else {
      // Обновляем комментарий существующей оценки в selectedCell
      const updatedCell = {
        ...selectedCell,
        lesson: {
          ...selectedCell.lesson,
          grades: selectedCell.lesson.grades.map((grade) =>
            grade.id === gradeId ? { ...grade, comment } : grade
          ),
        },
      }
      setSelectedCell(updatedCell)
    }
  }

  // Простая проверка загрузки
  if (periodsLoading) {
    return (
      <View style={styles.fallbackContainer}>
        <Text>Загрузка периодов...</Text>
      </View>
    )
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
          onSave={handleSaveTeacherData}
          loading={editGradesLoading}
          newGrades={newGrades}
          onAddGrade={handleAddGrade}
          onRemoveGrade={handleRemoveGrade}
          onUpdateGradeComment={handleUpdateGradeComment}
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
    minHeight: 200,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})
