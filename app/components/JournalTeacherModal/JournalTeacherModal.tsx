// components/JournalTeacherModal/JournalTeacherModal.tsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutAnimation,
  ActivityIndicator,
} from 'react-native'

interface JournalTeacherModalProps {
  visible: boolean
  selectedCell: any
  onClose: () => void
  onSave: (newGrade: string, newGradeComment: string, status: string, statusComment: string) => void
  loading?: boolean
  // Новые пропсы только для управления новыми оценками
  newGrades: any[]
  onAddGrade: (newGrade: string, newGradeComment: string) => void
  onRemoveGrade: (index: number) => void
  onUpdateGradeComment: (index: number, comment: string) => void
}

export const JournalTeacherModal: React.FC<JournalTeacherModalProps> = ({
  visible,
  selectedCell,
  onClose,
  onSave,
  loading = false,
  // Новые пропсы
  newGrades,
  onAddGrade,
  onRemoveGrade,
  onUpdateGradeComment,
}) => {
  const [newGrade, setNewGrade] = useState('')
  const [newGradeComment, setNewGradeComment] = useState('')
  const [contentHeights, setContentHeights] = useState<{ [key: string]: number }>({})
  const [status, setStatus] = useState(selectedCell?.status || '')
  const [statusComment, setStatusComment] = useState(selectedCell?.lesson?.comment || '')

  const statuses = [
    { status: 'П+', value: '10' },
    { status: 'П', value: '5' },
    { status: 'П-', value: '3' },
    { status: 'Н', value: '0' },
  ]

  // Обновляем состояние при изменении selectedCell
  useEffect(() => {
    if (selectedCell) {
      setStatus(selectedCell?.status || '')
      setStatusComment(selectedCell?.lesson?.comment || '')
    }
  }, [selectedCell])

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
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
  const handleAddGrade = () => {
    if (!newGrade.trim()) {
      Alert.alert('Ошибка', 'Введите оценку')
      return
    }

    const gradeValue = parseInt(newGrade)
    if (gradeValue < 1 || gradeValue > 5) {
      Alert.alert('Ошибка', 'Оценка должна быть от 1 до 5')
      return
    }

    onAddGrade(newGrade, newGradeComment)
    setNewGrade('')
    setNewGradeComment('')
  }
  const handleSave = () => {
    onSave(newGrade, newGradeComment, status, statusComment)
    setTimeout(() => {
      setNewGrade(''), setNewGradeComment('')
    }, 1000)
  }

  const handleStatusSelect = (statusValue: string) => {
    setStatus(statusValue)
  }

  const updateContentHeight = (key: string, height: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setContentHeights((prev) => ({
      ...prev,
      [key]: Math.max(height, 200),
    }))
  }

  const getMaxContentHeight = () => {
    const gradesHeight = contentHeights['grades'] || 200
    const commentsHeight = contentHeights['comments'] || 200
    return Math.max(gradesHeight, commentsHeight, 200)
  }

  const maxContentHeight = getMaxContentHeight()

  const onCloseAndClearModalData = () => {
    setNewGrade('')
    setNewGradeComment('')
    onClose()
  }

  if (!selectedCell) return null

  // Объединяем существующие и новые оценки для отображения
  const allGrades = [...(selectedCell?.lesson?.grades || []), ...newGrades]

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCloseAndClearModalData}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCloseAndClearModalData}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Блок статуса и комментария */}
            <View style={styles.statusRow}>
              {/* Статус */}
              <View style={styles.statusBlock}>
                <View style={styles.statusHeader}>
                  <Text style={styles.statusTitle}>Статус</Text>
                </View>
                <View style={styles.statusGrid}>
                  {statuses.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.statusItem,
                        { backgroundColor: status === s.value ? getStatusColor(s.value) : 'white' },
                      ]}
                      onPress={() => handleStatusSelect(s.value)}
                      disabled={loading}
                    >
                      <Text style={styles.statusText}>{s.status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Комментарий к статусу */}
              <View style={styles.commentBlock}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentTitle}>Комментарий</Text>
                </View>
                <View style={styles.commentContent}>
                  <TextInput
                    style={styles.commentInput}
                    value={statusComment}
                    onChangeText={setStatusComment}
                    placeholder="Ваш комментарий..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            {/* Блок оценок и комментариев */}
            <View style={styles.gradesRow}>
              {/* Оценки */}
              <View style={styles.gradesBlock}>
                <View style={styles.gradesHeader}>
                  <Text style={styles.gradesTitle}>Оценки</Text>
                </View>
                <View
                  style={[styles.gradesContent, { minHeight: maxContentHeight }]}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout
                    updateContentHeight('grades', height)
                  }}
                >
                  {/* Все оценки (существующие + новые) */}
                  {allGrades.map((grade: any, index: number) => (
                    <View key={index} style={styles.gradeItem}>
                      <Text style={styles.gradeText}>{grade.grade}</Text>
                      {/* Кнопка удаления только для новых оценок */}

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => onRemoveGrade(grade.id)}
                        disabled={loading}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Добавление новой оценки */}
                  <View style={styles.addGradeSection}>
                    <View style={styles.gradeInputRow}>
                      <TextInput
                        style={styles.gradeInput}
                        value={newGrade}
                        onChangeText={setNewGrade}
                        placeholder="Оценка"
                        keyboardType="numeric"
                        maxLength={1}
                        editable={!loading}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Комментарии к оценкам */}
              <View style={styles.gradesCommentBlock}>
                <View style={styles.gradesCommentHeader}>
                  <Text style={styles.gradesCommentTitle}>Комментарий</Text>
                </View>
                <View
                  style={[styles.gradesCommentContent, { minHeight: maxContentHeight }]}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout
                    updateContentHeight('comments', height)
                  }}
                >
                  {/* Комментарии ко всем оценкам */}
                  {allGrades.map((grade: any, index: number) => (
                    <View key={index} style={styles.gradeCommentItem}>
                      <TextInput
                        style={styles.gradeCommentInput}
                        value={grade.comment}
                        onChangeText={(text) => {
                          // Для существующих оценок - обновляем в selectedCell
                          // Для новых - используем обработчик
                          if (index < (selectedCell?.lesson?.grades?.length || 0)) {
                            // TODO: обновить существующие оценки если нужно
                          } else {
                            onUpdateGradeComment(
                              index - (selectedCell?.lesson?.grades?.length || 0),
                              text
                            )
                          }
                        }}
                        placeholder="Комментарий..."
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                        editable={!loading}
                      />
                    </View>
                  ))}

                  {/* Поле для комментария новой оценки */}
                  {newGrade && (
                    <View style={styles.gradeCommentItem}>
                      <TextInput
                        style={styles.gradeCommentInput}
                        value={newGradeComment}
                        onChangeText={setNewGradeComment}
                        placeholder="Комментарий"
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                        editable={!loading}
                      />
                    </View>
                  )}

                  {/* Сообщение если нет оценок */}
                  {allGrades.length === 0 && (
                    <View style={styles.noGradesMessage}>
                      <Text style={styles.noGradesText}>Нет оценок</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Кнопки - всегда видимы */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.addGradeButton, loading && styles.buttonDisabled]}
              onPress={handleAddGrade}
              disabled={loading}
            >
              <Text style={styles.addGradeButtonText}>Добавить оценку</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Сохранить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  currentStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  currentStatusLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
    color: '#333',
  },
  currentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
  },
  currentStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  commentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    height: 40,
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
  commentContent: {
    padding: 12,
    minHeight: 80,
  },
  commentInput: {
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  gradesRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    minHeight: 250,
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
  gradesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradesCommentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradesContent: {
    padding: 12,
    minHeight: 200,
  },
  gradesCommentContent: {
    padding: 12,
    minHeight: 200,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 40,
  },
  gradeText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  addGradeSection: {
    marginTop: 10,
  },
  gradeInputRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  gradeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    width: 65,
    textAlign: 'center',
  },
  addGradeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
  },
  addGradeButtonText: {
    color: 'black',
    fontWeight: '500',
    fontSize: 12,
  },
  gradeCommentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 60,
  },
  gradeCommentInput: {
    fontSize: 14,
    color: '#333',
    padding: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 4,
    textAlignVertical: 'top',
    minHeight: 50,
  },
  noGradesMessage: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noGradesText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
})
