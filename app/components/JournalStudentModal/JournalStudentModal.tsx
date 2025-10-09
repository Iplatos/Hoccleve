import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface LessonModalProps {
  visible: boolean
  selectedCell: any
  onClose: () => void
}

export const JournalStudentModal: React.FC<LessonModalProps> = ({
  visible,
  selectedCell,
  onClose,
}) => {
  const statuses = [
    { status: 'П+', value: '10' },
    { status: 'П', value: '5' },
    { status: 'П-', value: '3' },
    { status: 'Н', value: '0' },
  ]

  const getStatusColor = (lesson, statusValue) => {
    if (!lesson || !lesson.lessonData) return ''
    return statusValue === lesson.lessonData?.status
      ? getColorByStatus(lesson.lessonData.status)
      : ''
  }
  console.log(selectedCell, 'lfnfnfnfnfnf')

  const getColorByStatus = (status) => {
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

  if (!selectedCell) return null

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.statusRow}>
            <View style={styles.statusBlock}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Статус</Text>
              </View>
              <View style={styles.statusGrid}>
                {statuses.map((s, i) => (
                  <View
                    key={i}
                    style={[
                      styles.statusItem,
                      { backgroundColor: getStatusColor(selectedCell.lesson, s.value) },
                    ]}
                  >
                    <Text style={styles.statusText}>{s.status}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.commentBlock}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentTitle}>Комментарий</Text>
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentText}>
                  {selectedCell.lesson.lessonData?.comment || 'нет комментария'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.gradesRow}>
            <View style={styles.gradesBlock}>
              <View style={styles.gradesHeader}>
                <Text style={styles.gradesTitle}>Оценка</Text>
              </View>
              <View style={styles.gradesContent}>
                {selectedCell.lesson.lessonData?.grades?.length > 0 ? (
                  selectedCell.lesson.lessonData?.grades.map((grade, index) => (
                    <View key={index} style={styles.gradeItem}>
                      <Text style={styles.gradeText}>
                        {typeof grade === 'object' ? grade.grade : grade}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noGradesText}>нет оценок</Text>
                )}
              </View>
            </View>
            <View style={styles.gradesCommentBlock}>
              <View style={styles.gradesCommentHeader}>
                <Text style={styles.gradesCommentTitle}>Комментарий</Text>
              </View>
              <View style={styles.gradesCommentContent}>
                {selectedCell.lesson.lessonData?.grades?.length > 0 ? (
                  selectedCell.lesson.lessonData?.grades.map((grade, index) => (
                    <View key={index} style={styles.gradeCommentItem}>
                      <Text style={styles.gradeCommentText}>
                        {typeof grade === 'object'
                          ? grade.comment || 'нет комментария'
                          : 'нет комментария'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noGradesText}>нет комментариев</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '40%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  statusBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  commentBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  gradesBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  gradesCommentBlock: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  statusHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  commentHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  gradesHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  gradesCommentHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    height: 40,
  },
  commentContent: {
    padding: 12,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  gradesContent: {
    padding: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  gradesCommentContent: {
    padding: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  statusItem: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    width: '25%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    height: 40,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  commentText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  gradesRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  gradeItem: {
    borderBottomColor: '#f0f0f0',
  },
  gradeText: {
    fontSize: 12,
    textAlign: 'center',
    borderBottomColor: '#f0f0f0',
    color: '#333',
  },
  noGradesText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  gradeCommentItem: {},
  gradeCommentText: {
    fontSize: 12,
    textAlign: 'left',
    color: '#333',
  },
  modalButtons: {
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
  },
  closeButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
})
