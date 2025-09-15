import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import HTML from "react-native-render-html";
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {sendAnswer, SendAnswerPayload} from "../../../redux/slises/answerSlice.ts";
import {Colors} from "../../../constants/Colors.ts";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import {FileUploaderComponent} from "../../FileUploaderComponent/FileUploaderComponent.tsx";


type Props = {
    task: any;
    index: number

};

export const RepeatDetailAnswerComponent = ({task, index,}: Props) => {
    console.log(index, 'RepeatDetailAnswerComponent')

    const dispatch = useAppDispatch();
    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const [isLoading, setIsLoading] = useState(false); // Состояние для лоадера
    const [answer, setAnswer] = useState('');
  //  const [resultTitle, setResultTitle] = useState('');
    const [attempts, setAttempts] = useState(2); // Начальное значение по умолчанию

    const [buttonTitle, setButtonTitle] = useState('Ответить');
    const {result} = useAppSelector((state) => state.answerPost);
    const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.id)
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); // Теперь выбранные файлы хранятся здесь

    const can_redo = homeWork?.can_redo

    console.log('homeWork', homeWork)
    console.log('correct_answer', correct_answer)

    useEffect(() => {
            // Проверяем, если нет возможности перерешать и результат уже есть
        if (!can_redo && (result[task.task.id] || result[task.task.id]?.score !== undefined)) {
            setButtonTitle('Ответ принят');
            setAttempts(1); // Обнуляем количество попыток
            return;
        }


    }, []);


  //  const disabledBtn = buttonSendText === 'Ответ принят' || isLoading; // Блокируем кнопку, если идет загрузка

    const handleSubmit = async () => {
        const data: SendAnswerPayload = {
            answer: answer,
            children_id: homeWork?.children.id,
            answer_type: 'text',
            task_id: task?.id,
            lesson_id: homeWork?.id,
            answer_files: selectedFiles
        };


        if (answer || selectedFiles) {
            setIsLoading(true); // Начинаем загрузку, устанавливаем лоадер
            try {
                console.log('handleSubmit', data);
                await dispatch(sendAnswer(data));
            //    setButtonTitle('Ответ принят');
            } catch (error) {
                console.error('Ошибка при отправке ответа', error);
            } finally {
                setIsLoading(false); // Завершаем загрузку, скрываем лоадер
            }
        }
    };

    const setFiles = (files: any[]) => {
        setSelectedFiles(files)
        setAnswer('Ответ файлом')
    }

    return (
        <View style={styles.container}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'space-between',
                marginBottom: 10

            }}>
                <Text style={{color: Colors.colorGray}}>Задача {index}</Text>
                {/*<Text style={{color: getTextColor(resultText)}}>*/}
                {/*    {resultText}*/}
                {/*</Text>*/}
                {task?.complexity && <View style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    backgroundColor: Colors.white,
                    borderRadius: 20
                }}>
                    <Text>Сложность: {task.complexity}</Text>
                </View> }
            </View>

            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles.map((el: FileData) => (renderFile(el)))}

            <HTML
                baseStyle={{paddingBottom: 0, fontSize: 16, marginBottom: 10}}
                source={{html: convertJsonToHtml(task.question)}}
                contentWidth={300}
            />

            <View>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={Colors.textGray}
                    placeholder="Ответьте развернуто"
                    multiline
                    value={answer}
                    onChangeText={setAnswer}
                />
            </View>


            {/* Компонент загрузки файлов */}
            <FileUploaderComponent
              //  disabled={disabledBtn}
                onFilesSelected={setFiles} // передаем колбэк для получения файлов
               // onFilesSelected={setSelectedFiles} // передаем колбэк для получения файлов
            />

            <TouchableOpacity
             //   disabled={disabledBtn}
                onPress={handleSubmit}
                // style={[styles.answerSend,
                //     {backgroundColor: buttonSendText === 'Ответ принят' ? Colors.backgroundPurpleOpacity : Colors.white}]}
            >
                {isLoading ? (
                    <ActivityIndicator/> // Отображаем лоадер, если идет загрузка
                ) : (
                    <Text>qwer</Text> // Отображаем текст кнопки, если лоадера нет
                    // <Text>{buttonSendText}</Text> // Отображаем текст кнопки, если лоадера нет
                )}
            </TouchableOpacity>
            {/*{*/}
            {/*    (result[task.id]?.correct_answer || correct_answer?.correct_answer) && <View style={{flex: 1}}>*/}
            {/*        <Text style={[styles.answerBlock, {*/}
            {/*            backgroundColor: Colors.colorAccentRGB*/}
            {/*        }]}>Правильный ответ</Text>*/}
            {/*        <Text style={[styles.answerBlock, {*/}
            {/*            backgroundColor: Colors.white,*/}
            {/*            color: Colors.colorBlack*/}
            {/*        }]}>{result[task.id]?.correct_answer ? result[task.id]?.correct_answer : correct_answer?.correct_answer}*/}
            {/*        </Text>*/}
            {/*    </View>*/}
            {/*}*/}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    questionText: {
        marginVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    answerBlock: {
        //  width: '50%',
        backgroundColor: Colors.colorAccentFirst,
        borderRadius: 10,
        padding: 8,
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 7,
        fontSize: 16
    },
    input: {
        height: 80,
        fontSize: 16,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: 'white',
        marginBottom: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
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
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
