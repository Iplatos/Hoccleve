import React, {useEffect, useState} from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import HTML from "react-native-render-html";
import {useAppSelector} from "../../../redux/hooks.ts";
import {Colors} from "../../../constants/Colors.ts";

import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import {safeParse} from "../../../settings/utils.ts";
import MathJaxSvg from "react-native-mathjax-svg";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {TimeSpentBlock} from "../../TimeSpentBlock/TimeSpentBlock.tsx";


type Props = {
    task: any;
    index: number
    resultText?: string
    buttonSendText?: string,
    url?: string
};


export const ViewTestAnswerHomeWork = ({task, index, url, buttonSendText, resultText}: Props) => {

    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.id)
    const parsedQuestion = safeParse(task.question);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const answerOptions = JSON.parse(task.answer_options);
    const formula2 = parsedQuestion?.content?.find((form: any) => form.type === 'math')?.attrs?.value || ''

    useEffect(() => {
        if (correct_answer?.answer) {
            setSelectedOption(parseInt(correct_answer.answer)); // Преобразуем строку ответа в число
        }
    }, [correct_answer]);

    const handleOpenFile = (path: string) => {
        Linking.openURL(`${url}/${path}`)
            .catch(err => console.error("Не удалось открыть файл:", err));
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
                {/* Отображение формулы с MathJaxSvg */}
                <MathJaxSvg fontSize={16}>
                    {`${formula2}`}
                </MathJaxSvg>
            </View>

            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles?.map((el: FileData) => (renderFile(el)))}

            {answerOptions?.map((option: any) => (
                <View
                    key={option.index}
                    style={styles.optionContainer}
                >
                    <View style={styles.radioCircle}>
                        {selectedOption === option.index && (
                            <View style={styles.radioSelected}/>
                        )}
                    </View>
                    {/* Рендерим текст и формулу */}
                    {Array.isArray(option?.text?.content) ? (
                        option.text.content.map((item: any, i: number) => {
                            if (item.type === 'math') {
                                return (
                                    <MathJaxSvg key={i} fontSize={16}>
                                        {`${item.attrs.value}`}
                                    </MathJaxSvg>
                                );
                            } else {
                                return (
                                    <Text key={i} style={styles.optionText}>
                                        {item.content?.map((subItem: any) => subItem.text).join('')}
                                    </Text>
                                );
                            }
                        })
                    ) : (
                        <Text style={styles.optionText}>
                            {option.text}
                        </Text>
                    )}
                </View>
            ))}


            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                <View style={{flex: 1}}>
                    <Text style={styles.answerBlock}>Ваш ответ</Text>
                    <Text style={[styles.answerBlock, {
                        backgroundColor: Colors.white,
                        color: Colors.colorBlack,
                        flex: 1,
                        justifyContent: 'center'
                    }]}>{correct_answer?.answer}</Text>
                </View>
                {
                    correct_answer?.correct_answer &&
                    <View style={{flex: 1}}>
                        <Text style={[styles.answerBlock, {
                            backgroundColor: Colors.colorAccentRGB
                        }]}>Правильный ответ
                        </Text>
                        <Text style={[styles.answerBlock, {
                            backgroundColor: Colors.white,
                            color: Colors.colorBlack,
                            flex: 1,
                            justifyContent: 'center'
                        }]}>{correct_answer?.correct_answer}</Text>
                    </View>
                }
            </View>

            <TimeSpentBlock
                isTimedTask={task.is_timed_task}
                timeSpent={correct_answer?.time_spent!}
            />
            {
                correct_answer?.comment_files &&
                JSON.parse(correct_answer?.comment_files).map((file, index) => {
                   // console.log(file)
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
};

const styles = StyleSheet.create({
    container: {},

    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.colorAccent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioSelected: {
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: Colors.colorAccent,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
    },
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
        marginBottom: 15
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
