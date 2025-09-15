import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Image
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {Colors} from "../../../constants/Colors.ts";
import HTML from "react-native-render-html";
import MathJaxSvg from 'react-native-mathjax-svg';
import {getTextColor, safeParse} from "../../../settings/utils.ts";
import {sendAnswer} from "../../../redux/slises/answerSlice.ts";
import {useAppDispatch, useAppSelector, useFileUpload} from "../../../redux/hooks.ts";
import axios from "axios";
import {sendControlWorkAnswer} from "../../../redux/slises/controlWorkSendAnswerSlice.ts";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";

type Props = {
    task: any;
    index: number
    resultText: string
    handleSubmit?: (answer: any) => void
    correct_answer: any
    controlWorkId: number | undefined
};

export const FileAnswerControlWorkComponent = ({task, index, resultText, correct_answer, controlWorkId}: Props) => {
  //  console.log(task)
    const dispatch = useAppDispatch();
    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const {result, status} = useAppSelector((state) => state.sendControlWorkAnswer);
    const [buttonTitle, setButtonTitle] = useState('Ответить');
    const [resultTitle, setResultTitle] = useState('');
    //  const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.id)
    const {selectedFiles, handleFileUpload} = useFileUpload();

    const [isLoading, setIsLoading] = useState(false); // Состояние для лоадера

    const disabledBtn = buttonTitle === 'Ответ принят' || isLoading; // Блокируем кнопку, если идет загрузка

    //  console.log('FileAnswerControlWorkComponent', task)

    useEffect(() => {
        switch (correct_answer?.score) {
            case 0:
                setButtonTitle('Ответ принят');
                break;
            case 1:
                setButtonTitle('Ответ принят 1');
                break;
            case 2:
                setButtonTitle('Ответ принят');
                break;
            case 4:
                setButtonTitle('Ответ принят');
                break;
            default:
                setButtonTitle('Ответить');
        }

        if (result[task.id]) {
            setResultTitle(result[task.id]?.message || '')
        }


        if (result[task.id]) {
            setButtonTitle('Ответ принят');
        }
    }, [correct_answer, result]);

    const handleSubmit = async () => {

        const data = {
            answer: selectedFiles,  // Передаём файлы как объекты
            children_id: homeWork?.children.id,
            answer_type: 'file',
            task_id: task?.id,
            lesson_id: controlWorkId,
        };

        if (selectedFiles.length > 0) {
            setIsLoading(true); // Начинаем загрузку, устанавливаем лоадер
            try {
                console.log('handleSubmit', data);
                await dispatch(sendControlWorkAnswer(data));
                setButtonTitle('Ответ принят');
            } catch (error) {
                console.error('Ошибка при отправке ответа', error);
            } finally {
                setIsLoading(false); // Завершаем загрузку, скрываем лоадер
            }
        }
    };

    // Функция для открытия файла
    const handleOpenFile = () => {
        if (correct_answer?.answer) {
            Linking.openURL(`${axios.defaults.baseURL}/${correct_answer.answer}`)
                .catch(err => console.error("Не удалось открыть файл:", err));
        }
    };

    // Парсим текст вопроса
    const parsedQuestion = safeParse(task.question);
    const questionText1 = parsedQuestion?.content?.[0]?.content?.[0]?.text || '';
    //  const formula = parsedQuestion?.content?.[1]?.attrs?.value || '';
    const formula2 = parsedQuestion?.content?.find((form: any) => form.type === 'math')?.attrs?.value || ''
    const questionText2 = parsedQuestion?.content?.[2]?.content?.[0]?.text || '';


    return (
        <View style={{
            padding: 10,
            backgroundColor: '#e7ecf2',
            borderRadius: 10,
            marginBottom: 20
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'space-between',
                marginBottom: 10

            }}>
                <Text style={{color: Colors.colorGray}}>Задача {index}</Text>
                <Text style={{color: getTextColor(resultTitle ? resultTitle : resultText)}}>
                    {resultTitle ? resultTitle : resultText}
                </Text>
                {/*<View style={{*/}
                {/*    paddingHorizontal: 10,*/}
                {/*    paddingVertical: 5,*/}
                {/*    backgroundColor: Colors.white,*/}
                {/*    borderRadius: 20*/}
                {/*}}>*/}
                {/*    <Text>Сложность: {task.complexity}</Text>*/}
                {/*</View>*/}
            </View>

            {/* Отображение первой части вопроса */}
            <Text style={styles.questionText}>{questionText1}</Text>

            {/* Отображение формулы с MathJaxSvg */}
            <MathJaxSvg fontSize={16}>
                {`${formula2}`}
            </MathJaxSvg>

            {/* Отображение второй части вопроса */}
            <Text style={styles.questionText}>{questionText2}</Text>

            {/* Кнопка для загрузки файлов */}
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: '#e5d3b4',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 15,
                    opacity: disabledBtn ? 0.5 : 1
                }}
                disabled={disabledBtn}
                onPress={handleFileUpload}
            >
                <Text>Загрузить файлы</Text>
                <Text>+</Text>
            </TouchableOpacity>

            {/* Список выбранных файлов */}
            {selectedFiles.length > 0 && (
                <ScrollView style={styles.fileList}>
                    {selectedFiles.map((file, index) => (
                        <Text key={index} style={styles.fileName}>
                            {file.name} {/* Отображаем только имя файла */}
                        </Text>
                    ))}
                </ScrollView>
            )}

            {/* Если это изображение, отобразить его */}
            {correct_answer?.answer ? (
                // Если это изображение, отображаем его
                correct_answer.answer.endsWith('.png') || correct_answer.answer.endsWith('.jpg') || correct_answer.answer.endsWith('.jpeg') ? (
                    <TouchableOpacity onPress={handleOpenFile}>
                        <Image
                            source={{uri: `${axios.defaults.baseURL}/${correct_answer.answer}`}}
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
            <TouchableOpacity
                disabled={disabledBtn || selectedFiles.length === 0}
                onPress={handleSubmit}
                style={[styles.answerSend,
                    {backgroundColor: buttonTitle === 'Ответ принят' ? Colors.backgroundPurpleOpacity : Colors.white}]}
            >
                {isLoading ? (
                    <ActivityIndicator/> // Отображаем лоадер, если идет загрузка
                ) : (
                    <Text>{buttonTitle}</Text> // Отображаем текст кнопки, если лоадера нет
                )}
            </TouchableOpacity>
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
    btnOpenFile: {
        backgroundColor: '#e5d3b4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    promptText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    questionText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    formulaText: {
        fontSize: 16,
        marginBottom: 16,
        color: '#0000FF', // Цвет для формулы
    },
    fileList: {
        marginTop: 16,
        maxHeight: 150,
    },
    fileName: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
});
