import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors } from '../../constants/Colors.ts'
import MathJaxSvg from 'react-native-mathjax-svg'
import { safeParse } from '../../settings/utils.ts'
import { ResultType, SendAnswerPayload } from '../../redux/slises/answerSlice.ts'
import { FileUploaderComponent } from '../FileUploaderComponent/FileUploaderComponent.tsx'
import { FileData } from '../../redux/slises/probeWorkSlice.ts'
import { renderFile } from '../../settings/helpers.tsx'
import { HomeWorkResults } from '../../redux/slises/homeWorkDetailSlice.ts'
import { GlobalStyle } from '../../constants/GlobalStyle.ts'
import { TaskHeader } from '../TaskHeader/TaskHeader.tsx'

type Props = {
  task: any
  index: number
  resultText: string
  childrenId: number
  lessonId: number
  result: ResultType
  correct_answer: HomeWorkResults
  isCompletedWork?: boolean
  buttonSendText: string
  url: string | null
  handleSubmit: (answer: string, taskId?: string, answerData?: SendAnswerPayload) => void
}

export const NFileAnswerComponent = ({
  task,
  index,
  correct_answer,
  buttonSendText,
  result,
  isCompletedWork,
  lessonId,
  childrenId,
  url,
  handleSubmit,
  resultText,
}: Props) => {
  console.log(index, 'NFileAnswerComponent')
  //console.log('NFileAnswerComponent', task)

  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const disabledBtn = buttonSendText === 'Ответ принят' || isLoading

  // Функция для загрузки файла задания
  const handleDownloadTaskFile = (file: FileData) => {
    if (file?.file_path) {
      Linking.openURL(`${url}${file.file_path}`).catch((err) =>
        console.error('Не удалось открыть файл задания:', err)
      )
    }
  }

  // Функция для открытия файла ответа
  const handleOpenAnswerFile = () => {
    if (correct_answer?.answer) {
      Linking.openURL(`${url}${correct_answer.answer}`).catch((err) =>
        console.error('Не удалось открыть файл:', err)
      )
    }
  }

  const submitHandler = async () => {
    if (selectedFiles.length === 0) return

    const [firstFile, ...otherFiles] = selectedFiles

    const data: SendAnswerPayload = {
      answer: firstFile,
      children_id: childrenId,
      answer_type: 'file',
      task_id: task?.id,
      lesson_id: lessonId,
      answer_files: otherFiles,
    }

    setIsLoading(true)
    try {
      console.log('handleSubmit', data)
      await handleSubmit('', task.id, data)
    } catch (error) {
      console.error('Ошибка при отправке ответа', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Парсим текст вопроса
  const parsedQuestion = safeParse(task.question)
  const questionText1 = parsedQuestion?.content?.[0]?.content?.[0]?.text || ''
  const formula2 =
    parsedQuestion?.content?.find((form: any) => form.type === 'math')?.attrs?.value || ''
  const questionText2 = parsedQuestion?.content?.[2]?.content?.[0]?.text || ''

  // Функция для рендера файлов задания
  const renderTaskFile = (file: FileData) => {
    const fileName = file.file_path?.split('/').pop() || 'Файл'

    // Для документов показываем кнопку загрузки
    if (
      file.file_path &&
      (file.file_path.endsWith('.docx') ||
        file.file_path.endsWith('.doc') ||
        file.file_path.endsWith('.pdf') ||
        file.file_path.endsWith('.txt'))
    ) {
      return (
        <View key={file.id} style={styles.fileDownloadContainer}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => handleDownloadTaskFile(file)}
          >
            <Text style={styles.downloadButtonText}> Скачать файл задания</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // Для изображений и аудио используем существующий renderFile
    return <View key={file.id}>{renderFile(file)}</View>
  }

  return (
    <View style={GlobalStyle.taskContainer}>
      <TaskHeader taskId={task.id} index={index} result={result} resultText={resultText} />

      {/* Отображение файлов задания */}
      {task?.homeTaskFiles.map(renderTaskFile)}

      <ScrollView horizontal={!!formula2} style={{ paddingVertical: 15 }}>
        <Text style={styles.questionText}>{questionText1}</Text>
        <MathJaxSvg fontSize={16}>{`${formula2}`}</MathJaxSvg>
        <Text style={styles.questionText}>{questionText2}</Text>
      </ScrollView>

      {/* Компонент загрузки файлов для ответа */}
      <FileUploaderComponent disabled={disabledBtn} onFilesSelected={setSelectedFiles} />

      {/* Отображение загруженного ответа */}
      {correct_answer?.answer ? (
        correct_answer.answer.endsWith('.png') ||
        correct_answer.answer.endsWith('.jpg') ||
        correct_answer.answer.endsWith('.jpeg') ? (
          <TouchableOpacity onPress={handleOpenAnswerFile}>
            <Image
              source={{ uri: `${url}${correct_answer.answer}` }}
              style={{ width: '100%', height: 100, marginBottom: 10 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleOpenAnswerFile} style={GlobalStyle.btnOpenFile}>
            <Text>Открыть файл ответа</Text>
          </TouchableOpacity>
        )
      ) : null}

      {/* Кнопка отправки ответа */}
      {isCompletedWork ? null : (
        <TouchableOpacity
          disabled={disabledBtn || selectedFiles.length === 0}
          onPress={submitHandler}
          style={[
            styles.answerSend,
            {
              backgroundColor:
                buttonSendText === 'Ответ принят' ? Colors.backgroundPurpleOpacity : Colors.white,
            },
          ]}
        >
          {isLoading ? <ActivityIndicator /> : <Text>{buttonSendText}</Text>}
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  answerSend: {
    width: '50%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 8,
    color: Colors.colorBlack,
    alignItems: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  fileDownloadContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  downloadButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: Colors.colorBlack,
    fontWeight: 'bold',
    fontSize: 14,
  },
})

export default NFileAnswerComponent
