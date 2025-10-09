import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchJournalData } from '../redux/slises/generalStudentJournalSlice'
import { fetchPeriods, setSelectedPeriod } from '../redux/slises/periodSlice'
import { getSortByField, getUnionDate, removeDuplicates } from '../settings/helpers'

import { JournalStudentTable } from '../components/JournalStudentModal/JournalStudentTable'
import { JournalStudentModal } from '../components/JournalStudentTable/JournalStudentModal'
import JournalHeader from '../components/DropdownComponent/DropdownForJournal/DropdownForJournal'

export const JournalScreen = () => {
  const dispatch = useAppDispatch()
  const { data: dataUS, loading, error } = useAppSelector((state) => state.generalStudentJournal)
  const { periods, loading: periodsLoading } = useAppSelector((state) => state.periods)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

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
        await dispatch(
          fetchJournalData({
            start_date: targetPeriod.start_date,
            end_date: targetPeriod.end_date,
          })
        ).unwrap()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsInitialLoad(false)
      }
    }

    loadInitialData()
  }, [dispatch])

  const data = dataUS !== null && dataUS !== undefined ? dataUS : { directions: [], dates: [] }
  const unionDates =
    data.dates && data.dates.length > 0
      ? getUnionDate(removeDuplicates(data.dates)).slice().sort(getSortByField('date'))
      : []

  const openModal = (direction, unionDate, lesson) => {
    setSelectedCell({
      direction: direction.name,
      date: unionDate.date,
      lesson: lesson,
      topic: lesson.topic,
    })
    setIsModalVisible(true)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setSelectedCell(null)
  }

  if (isInitialLoad || periodsLoading) {
    return <Text>Loading</Text>
  }

  return (
    <ScrollView style={styles.container}>
      <JournalHeader />
      <JournalStudentTable data={data} dates={unionDates} onCellPress={openModal} />
      <JournalStudentModal
        visible={isModalVisible}
        selectedCell={selectedCell}
        onClose={closeModal}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
