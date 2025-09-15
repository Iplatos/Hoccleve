import React from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import HTML from "react-native-render-html";
import {useAppSelector} from "../../../redux/hooks.ts";
import {Colors} from "../../../constants/Colors.ts";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {FileListViewer} from "../../FileListViewer/FileListViewer.tsx";
import {TimeSpentBlock} from "../../TimeSpentBlock/TimeSpentBlock.tsx";
import {jsonConvert} from "../../../settings/utils.ts";
import Constructor from "../../FormulaConstructor/Constructor.tsx";
import {CorrectConstructorAnswer} from "../../FormulaConstructor/components/CorrectConstructorAnswer.tsx";


type Props = {
    task: any;
    index: number
    resultText?: string
    buttonSendText?: string
    url?: string
};

export const renderCorrectAnswerText = (correct_answer: string) => {
    // Преобразуем строку JSON в объект
    let parsedAnswer;
    try {
        parsedAnswer = JSON.parse(correct_answer);
    } catch (error) {
        console.error('Ошибка парсинга correct_answer:', error);
        return <Text>Неверный формат данных</Text>;
    }

    // Проверяем, что parsedAnswer является массивом
    if (!Array.isArray(parsedAnswer)) {
        return <Text>Неверный формат данных</Text>;
    }

    // Отрисовываем текстовые элементы
    return (
        <>
            {parsedAnswer.map((item) => (
                <Text style={{
                    flex: 1,
                    fontWeight: 'bold',
                    fontSize: 16,
                    textAlign: 'center'
                }} key={item.index}>{item.text}</Text>
            ))}
        </>
    );
};

export const ViewOrderAndDetailAnswerHomeWork = ({task, index, url, buttonSendText, resultText}: Props) => {
        console.log('ViewOrderAndDetailAnswerHomeWork', index, task);
        const {homeWork} = useAppSelector(state => state.homeworkDetail);
        const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.id)

        const handleOpenFile = (path: string) => {
            if (path) {
                Linking.openURL(`${url}/${path}`)
                    .catch(err => console.error("Не удалось открыть файл:", err));
            }
        };

        const userAnswer = jsonConvert(correct_answer?.answer, 'string')
        const correctAnswerResult = jsonConvert(correct_answer?.correct_answer, 'string')
        //  console.log('correct_answer', correct_answer)

        console.log('userAnswer', userAnswer)

        const renderAnswer = () => {
            if (!userAnswer) return null;

            if (typeof userAnswer === 'string') {
                return (
                    <Text style={{fontSize: 16}}>
                        {userAnswer}
                    </Text>
                );
            }

            // Объект конструктора
            if (
                typeof userAnswer === 'object' &&
                'type' in userAnswer &&
                userAnswer.type === 'constructor' &&
                Array.isArray(userAnswer.value)
            ) {
                return (
                    <Constructor
                        value={userAnswer.value}
                        prohibitEditing={true}
                        validate={false}
                    />
                )
            }
            return null;
        };

        return (
            <View style={GlobalStyle.taskContainer}>
                <Text style={{color: Colors.colorGray, marginBottom: 10}}>Задача {index}</Text>
                <View style={styles.section}>
                    <HTML
                        baseStyle={{paddingBottom: 0, fontSize: 16, marginBottom: 10}}
                        source={{html: convertJsonToHtml(task.question)}}
                        contentWidth={300}
                    />
                </View>

                {/* Отображение картинки или аудио */}
                {task?.homeTaskFiles.map((el: FileData) => (renderFile(el)))}


                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                    <View style={{flex: 1}}>
                        <Text style={styles.answerBlock}>Ваш ответ</Text>

                        <Text style={[styles.answerBlock, {
                            backgroundColor: Colors.white,
                            color: Colors.colorBlack,
                            flex: 1,
                            justifyContent: 'center'
                        }]}>{renderAnswer()}</Text>
                    </View>
                    {/*{*/}
                    {/*    correct_answer?.correct_answer &&*/}
                    {/*    <View style={{flex: 1}}>*/}
                    {/*        <Text style={[styles.answerBlock, {*/}
                    {/*            backgroundColor: Colors.colorAccentRGB*/}
                    {/*        }]}>Правильный ответ*/}
                    {/*        </Text>*/}

                    {/*        {task.type === 'exact-answer'*/}
                    {/*            ? <Text style={[styles.answerBlock, {*/}
                    {/*                backgroundColor: Colors.white,*/}
                    {/*                color: Colors.colorBlack,*/}
                    {/*                flex: 1,*/}
                    {/*                justifyContent: 'center'*/}
                    {/*            }]}>{renderCorrectAnswerText(correct_answer?.correct_answer)}</Text>*/}
                    {/*            : <Text style={[styles.answerBlock, {*/}
                    {/*                backgroundColor: Colors.white,*/}
                    {/*                color: Colors.colorBlack,*/}
                    {/*                flex: 1,*/}
                    {/*                justifyContent: 'center'*/}
                    {/*            }]}>{correct_answer?.correct_answer}</Text>*/}
                    {/*        }*/}
                    {/*    </View>*/}
                    {/*}*/}

                </View>

                <CorrectConstructorAnswer
                    showCorrectAnswers={true}
                    correctAnswer={correctAnswerResult}
                    isConstructor={true}
                />

                <TimeSpentBlock
                    isTimedTask={task.is_timed_task}
                    timeSpent={correct_answer?.time_spent!}
                />

                <FileListViewer files={correct_answer?.answer_files || []}/>
                {
                    correct_answer?.comment_files &&
                    JSON.parse(correct_answer?.comment_files).map((file, index) => {
                        //  console.log(file)
                        return (
                            <TouchableOpacity key={`${file.path}${index}`} onPress={() => handleOpenFile(file.path)}
                                              style={GlobalStyle.btnOpenFile}>
                                <Text style={{fontSize: 16, textAlign: 'center'}}>Вложение № {index + 1}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
                {
                    correct_answer?.comment &&
                    <View style={{marginTop: 10}}>
                        <Text style={{color: Colors.colorGray, marginBottom: 10}}>Комментарий учителя</Text>
                        <Text>{correct_answer?.comment}</Text>
                    </View>
                }
            </View>

        );
    }
;

const styles = StyleSheet.create({
    container: {},
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    section: {
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
        // marginBottom: 7,
        fontSize: 16
    },
    btnOpenFile: {
        backgroundColor: Colors.colorWhite,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        //  marginBottom: 15,
        marginTop: 10
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
