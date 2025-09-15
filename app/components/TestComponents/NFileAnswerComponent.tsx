import React, {useState} from 'react';
import {ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from "../../constants/Colors.ts";
import MathJaxSvg from 'react-native-mathjax-svg';
import {safeParse} from "../../settings/utils.ts";
import {ResultType, SendAnswerPayload} from "../../redux/slises/answerSlice.ts";
import {FileUploaderComponent} from "../FileUploaderComponent/FileUploaderComponent.tsx";
import {FileData} from "../../redux/slises/probeWorkSlice.ts";
import {renderFile} from "../../settings/helpers.tsx";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";

type Props = {
    task: any;
    index: number;
    resultText: string;
    childrenId: number,
    lessonId: number,
    result: ResultType;
    correct_answer: HomeWorkResults;
    isCompletedWork?: boolean;
    buttonSendText: string;
    url: string | null;
    handleSubmit: (answer: string, taskId?: string, answerData?: SendAnswerPayload) => void
};

export const NFileAnswerComponent = (
    {
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
        resultText
    }: Props) => {
    console.log(index, 'NFileAnswerComponent',)

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); // Теперь выбранные файлы хранятся здесь

    const [isLoading, setIsLoading] = useState(false); // Состояние для лоадера

    const disabledBtn = buttonSendText === 'Ответ принят' || isLoading; // Блокируем кнопку, если идет загрузка


    const submitHandler = async () => {
        if (selectedFiles.length === 0) return;

        // Разделим файлы: первый — в answer, остальные — в answer_files
        const [firstFile, ...otherFiles] = selectedFiles;

        const data: SendAnswerPayload = {
            answer: firstFile, // первый файл
            children_id: childrenId,
            answer_type: 'file',
            task_id: task?.id,
            lesson_id: lessonId,
            answer_files: otherFiles // остальные файлы
        };

        setIsLoading(true);
        try {
            console.log('handleSubmit', data);
            await handleSubmit('', task.id, data);
        } catch (error) {
            console.error('Ошибка при отправке ответа', error);
        } finally {
            setIsLoading(false);
        }
    };


    // Функция для открытия файла
    const handleOpenFile = () => {
        if (correct_answer?.answer) {
            Linking.openURL(`${url}/${correct_answer.answer}`)
                .catch(err => console.error("Не удалось открыть файл:", err));
        }
    };

    // Парсим текст вопроса
    const parsedQuestion = safeParse(task.question);
    const questionText1 = parsedQuestion?.content?.[0]?.content?.[0]?.text || '';
    const formula2 = parsedQuestion?.content?.find((form: any) => form.type === 'math')?.attrs?.value || ''
    const questionText2 = parsedQuestion?.content?.[2]?.content?.[0]?.text || '';


    return (
        <View style={GlobalStyle.taskContainer}>
            <TaskHeader
                taskId={task.id}
                index={index}
                result={result}
                resultText={resultText}
            />

            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles.map((el: FileData) => {
                return (
                    <View key={el.id}>
                        {renderFile(el)}
                    </View>
                )
            })}

            <ScrollView
                horizontal={!!formula2}
                style={{paddingVertical: 15}}>
                {/* Отображение первой части вопроса */}
                <Text style={styles.questionText}>{questionText1}</Text>

                {/* Отображение формулы с MathJaxSvg */}
                <MathJaxSvg fontSize={16}>
                    {`${formula2}`}
                </MathJaxSvg>

                {/* Отображение второй части вопроса */}
                <Text style={styles.questionText}>{questionText2}</Text>

            </ScrollView>


            {/* Компонент загрузки файлов */}
            <FileUploaderComponent
                disabled={disabledBtn}
                onFilesSelected={setSelectedFiles} // передаем колбэк для получения файлов
            />

            {/* Если это изображение, отобразить его */}
            {correct_answer?.answer ? (
                // Если это изображение, отображаем его
                correct_answer.answer.endsWith('.png') || correct_answer.answer.endsWith('.jpg') || correct_answer.answer.endsWith('.jpeg') ? (
                    <TouchableOpacity onPress={handleOpenFile}>
                        <Image
                            source={{uri: `${url}${correct_answer.answer}`}}
                            style={{width: '100%', height: 100, marginBottom: 10}}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                ) : (
                    // Если это другой тип файла, отображаем кнопку для открытия файла
                    <TouchableOpacity onPress={handleOpenFile} style={GlobalStyle.btnOpenFile}>
                        <Text>Открыть файл</Text>
                    </TouchableOpacity>
                )
            ) : null}
            {
                isCompletedWork
                    ? null
                    : <TouchableOpacity
                        disabled={disabledBtn || selectedFiles.length === 0}
                        onPress={submitHandler}
                        style={[styles.answerSend,
                            {backgroundColor: buttonSendText === 'Ответ принят' ? Colors.backgroundPurpleOpacity : Colors.white}]}
                    >
                        {isLoading ? (
                            <ActivityIndicator/> // Отображаем лоадер, если идет загрузка
                        ) : (
                            <Text>{buttonSendText}</Text> // Отображаем текст кнопки, если лоадера нет
                        )}
                    </TouchableOpacity>
            }


        </View>
    );
};


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
        justifyContent: "center"
    },
    questionText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
});
