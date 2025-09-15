import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Image, Linking, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Colors} from "../../constants/Colors.ts";
import {FileUploaderComponent} from "../FileUploaderComponent/FileUploaderComponent.tsx";
import {ResultType, SendAnswerPayload} from "../../redux/slises/answerSlice.ts";
import {convertJsonToHtml, renderFile} from "../../settings/helpers.tsx";

import HTML from "react-native-render-html";
import {styles, TaskHeader} from "../TaskHeader/TaskHeader.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import Toast from "react-native-toast-message";

import {Task} from "../../redux/slises/homeworkSlice.ts";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";
import {getUrl} from "../../settings/utils.ts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {startHomeworkTimer} from "../../redux/slises/homeworkTimerSlice.ts";
import {TimedTaskPrevComponent} from "../TimedTaskPrevComponent/TimedTaskPrevComponent.tsx";

type Props = {
    task: Task;
    index: number;
    childrenId: number,
    result: ResultType;
    correct_answer: HomeWorkResults;
    lessonId: number,
    isCompletedWork?: boolean,
    resultText: string;
    handleSubmit: (option: string, taskId?: string, answerData?: SendAnswerPayload) => void
    buttonSendText: string;
    isTimedTask?: boolean

};
const MemoizedRenderHtml = React.memo(HTML);


export const NDetailAnswerComponent = (
    {
        task,
        index,
        childrenId,
        isCompletedWork,
        correct_answer,
        lessonId,
        result,
        handleSubmit,
        buttonSendText,
        resultText,
        isTimedTask
    }: Props) => {
    console.log(index, 'NDetailAnswerComponent')
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false); // Состояние для лоадера
    const [answer, setAnswer] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); // Теперь выбранные файлы хранятся здесь
    const {data: homeworkTimerData} = useAppSelector(state => state.homeworkTimer)
    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const taskStarted = homeworkTimerData[task.id];

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);

    const disabledBtn = buttonSendText === 'Ответ принят' || isLoading; // Блокируем кнопку, если идет загрузка

    const [url, setUrlState] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };
        fetchUrl();
    }, []);


    const submitHandler = async () => {
        if (isLoading) return;

        const data: SendAnswerPayload = {
            answer: answer,
            children_id: childrenId,
            answer_type: 'text',
            task_id: task?.id,
            lesson_id: lessonId,
            answer_files: selectedFiles
        };

        if (answer || selectedFiles) {
            setIsLoading(true);
            try {
                await handleSubmit(answer, task.id.toString(), data); // отправляем массив ответов

            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Ошибка',
                    text2: 'Ошибка при отправке! Повторите еще раз!',
                    position: 'bottom',
                    bottomOffset: 50,
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const setFiles = (files: any[]) => {
        setSelectedFiles(files)
        setAnswer('Ответ файлом')
    }
    const handleOpenFile = (fileUri: string) => {
        // console.log(fileUri)
        if (correct_answer?.answer_files) {
            Linking.openURL(fileUri)
                .catch(err => console.error("Не удалось открыть файл:", err));
        }
    };

    const startTaskHandler = async () => {
        setIsLoading(true);
        try {
            dispatch(startHomeworkTimer({task_id: task.id, work_id: homeWork?.id!}))
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: 'Повторите еще раз!',
                position: 'bottom',
                bottomOffset: 50,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={GlobalStyle.taskContainer}>
            {
                disabledBtn
                    ? <TaskHeader
                        index={index}
                        complexity={task?.complexity}
                        resultText={resultText}
                        taskId={task.id}
                        result={result}
                    />
                    : isTimedTask && !taskStarted
                        ?
                        <TimedTaskPrevComponent
                            index={index}
                            complexity={task?.complexity}
                            resultText={resultText}
                            taskId={task.id}
                            result={result}
                            taskStarted={taskStarted!}
                            startTaskHandler={startTaskHandler}
                            isLoading={isLoading}
                        />
                        :
                        <>
                            <TaskHeader
                                index={index}
                                complexity={task?.complexity}
                                resultText={resultText}
                                taskId={task.id}
                                result={result}
                                taskStarted={taskStarted!}
                            />

                            {/* Отображение картинки или аудио */}
                            {task?.homeTaskFiles.map((el) => {
                                return (
                                    <View key={`${el.id}${index}`}>{renderFile(el)}</View>
                                )
                            })}

                            {/* Вопрос */}
                            <MemoizedRenderHtml
                                baseStyle={GlobalStyle.taskQuestion}
                                source={{html: memoizedHtml}}
                                contentWidth={300}
                            />

                            <View>
                                <TextInput
                                    style={GlobalStyle.taskInputTextArea}
                                    placeholder="Ответьте развернуто"
                                    placeholderTextColor={Colors.textGray}
                                    multiline
                                    value={answer}
                                    onChangeText={setAnswer}
                                />
                            </View>

                            {/* Компонент загрузки файлов */}
                            <FileUploaderComponent
                                disabled={disabledBtn}
                                onFilesSelected={setFiles}
                            />

                            {
                                isCompletedWork ? (
                                    <>
                                        {/* Проверка на наличие файлов в ответе */}
                                        {correct_answer?.answer_files && correct_answer.answer_files.length > 0 && (
                                            correct_answer.answer_files.map((file: any, index: number) => {
                                                // Проверка расширения файла
                                                const isImage = file.extension === 'png' || file.extension === 'jpg' || file.extension === 'jpeg';
                                                const fileUri = `${url}/${file.path}`;

                                                return isImage ? (
                                                    // Если это изображение, отображаем его
                                                    <TouchableOpacity key={index}
                                                                      onPress={() => handleOpenFile(fileUri)}>
                                                        <Image
                                                            source={{uri: fileUri}}
                                                            style={{width: '100%', height: 100, marginBottom: 10}}
                                                            resizeMode="cover"
                                                        />
                                                    </TouchableOpacity>
                                                ) : (
                                                    // Если это не изображение, отображаем кнопку для открытия файла
                                                    <TouchableOpacity key={index}
                                                                      onPress={() => handleOpenFile(fileUri)}
                                                                      style={GlobalStyle.btnOpenFile}>
                                                        <Text>Открыть файл {file.name} ({file.extension})</Text>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        )}
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        disabled={disabledBtn}
                                        onPress={submitHandler}
                                        style={[
                                            GlobalStyle.taskAnswerBtn,
                                            {
                                                backgroundColor: buttonSendText === 'Ответ принят'
                                                    ? Colors.backgroundPurpleOpacity
                                                    : Colors.white
                                            }
                                        ]}
                                    >
                                        {isLoading ? <ActivityIndicator/> : <Text>{buttonSendText}</Text>}
                                    </TouchableOpacity>
                                )
                            }
                        </>
            }
        </View>
    );
};


