import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useAppSelector} from "../../../redux/hooks.ts";
import {Colors} from "../../../constants/Colors.ts";
import HTML from "react-native-render-html";
import {convertJsonToHtml} from "../../../settings/helpers.tsx";
import {handleOpenFile} from "../../../settings/utils.ts";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {TimeSpentBlock} from "../../TimeSpentBlock/TimeSpentBlock.tsx";


type Props = {
    task: any;
    index: number
    resultText?: string
    buttonSendText?: string
};

export type MatchedPair = {
    left: AnswerOption;
    right: AnswerOption;
    color: string;
};
export type AnswerOption = {
    id: number;
    img: string;
    text: string;
};

export const extractText = (text: string) => {
    try {
        // Заменяем двойные escape-последовательности для корректного парсинга
        const unescapedText = text.replace(/\\\\u/g, '\\u');
        const parsedText = JSON.parse(text);
        const paragraph = parsedText.content.find(
            (item: any) => item.type === 'paragraph'
        );
        // console.log('paragraph', paragraph)
        return paragraph?.content.map((item: any) => item.text).join('') || '';
    } catch (error) {
        console.error('Error extracting text:', error);
        return '';
    }
};

export const parseAnswerOptions = (options: string) => {
    try {
        return JSON.parse(options);
    } catch (error) {
        console.error('Error parsing answer options:', error);
        return {left: [], right: []};
    }
};


export const ViewMatchAnswerHomeWork = ({task, index, buttonSendText, resultText}: Props) => {
    console.log('ViewMatchAnswerHomeWork')
    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.id)
    const {left = [], right = []} = parseAnswerOptions(task.answer_options);
    const [selectedPairs, setSelectedPairs] = useState<MatchedPair[]>([]);

    // Массив цветов для выделения пар
    const pairColors = ['#FFB6C1', '#ADD8E6', '#90EE90', '#FFD700', '#FFA07A', '#20B2AA', '#FF69B4', '#9370DB'];

    // Распарси ответ, если он есть, и обнови выбранные пары
    useEffect(() => {
        if (correct_answer?.answer) {
            const parsedAnswer = JSON.parse(correct_answer.answer);
            setSelectedPairs(parsedAnswer);
        }
    }, [correct_answer]);


    const getColorForOption = (option: AnswerOption) => {
        // Найди пару, в которую входит данный option
        const pairIndex = selectedPairs.findIndex(
            pair => String(pair.left) === String(option.id) || String(pair.right) === String(option.id)
        );
        // Если такая пара есть, верни её цвет из массива pairColors
        return pairIndex !== -1 ? pairColors[pairIndex % pairColors.length] : 'transparent';
    };

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray, marginBottom: 10}}>Задача {index}</Text>
            <View style={styles.section}>
                <HTML
                    baseStyle={{paddingBottom: 0, fontSize: 16,}}
                    source={{html: convertJsonToHtml(task.question)}}
                    contentWidth={300}
                />
            </View>

            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                <View style={{flex: 1}}>
                    <Text style={styles.answerBlock}>Ваш ответ</Text>
                </View>
            </View>

            <View style={styles.optionsContainer}>
                <View style={styles.column}>
                    {left.map((option: AnswerOption) => (
                        <View
                            key={option.id}
                            style={[styles.option, {backgroundColor: getColorForOption(option)}]}
                        >
                            <Text>{extractText(option.text)}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.column}>
                    {right.map((option: AnswerOption) => (
                        <View
                            key={option.id}
                            style={[styles.option, {backgroundColor: getColorForOption(option)}]}
                        >
                            <Text>{extractText(option.text)}</Text>
                        </View>
                    ))}
                </View>
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
                        <TouchableOpacity key={`${file.path}${index}`} onPress={() => handleOpenFile(file.path)} style={GlobalStyle.btnOpenFile}>
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
    optionsContainer: {
        flexDirection: 'row',
        marginTop: 16,
    },
    option: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginBottom: 5
    },
    column: {
        flex: 1,
        paddingHorizontal: 8,
    },
    columnTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
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
