import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import HTML from 'react-native-render-html';
import {Colors} from "../../constants/Colors.ts";
import {convertJsonToHtml, renderFile} from "../../settings/helpers.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";


export type AnswerOption = {
    id: number;
    img: string;
    text: string;
};

export type MatchedPair = {
    left: AnswerOption;
    right: AnswerOption;
    color: string;
};

type Props = {
    task: any;
    index: number;
    resultText: string;
    buttonSendText: string,
    correct_answer: HomeWorkResults;
    result: ResultType;
    handleSubmit: (answer: string, taskId?: string) => void

};

const MemoizedRenderHtml = React.memo(HTML);

export const NMatchComponent = (
    {
        task,
        resultText,
        result,
        correct_answer,
        index,
        handleSubmit,
        buttonSendText
    }: Props) => {
    console.log(index, 'NMatchComponent', correct_answer);

    const {left = [], right = []} = parseAnswerOptions(task.answer_options);
    const [selectedPairs, setSelectedPairs] = useState<MatchedPair[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Состояние для лоадера
    const [answer, setAnswer] = useState<any>()
    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);

    const parsedCorrectAnswer = correct_answer ? JSON.parse(correct_answer?.answer) : [];

    const findOptionById = (options: AnswerOption[], id: number) => {
        return options.find(option => option.id === id);
    };

    useEffect(() => {
        setAnswer(selectedPairs.map(pair => ({
            left: pair.left.id,
            right: pair.right?.id,
        })))

    }, [selectedPairs]);

    const handleSelectLeft = (option: AnswerOption) => {
        const isSelected = selectedPairs.some(pair => pair.left.id === option.id);

        if (isSelected) {
            setSelectedPairs(prev => prev.filter(pair => pair.left.id !== option.id));
        } else {
            // @ts-ignore
            setSelectedPairs(prev => [
                ...prev,
                {left: option, right: null, color: generatePairColor(prev.length)}
            ]);
        }
    };

    const handleSelectRight = (option: AnswerOption) => {
        const isSelected = selectedPairs.some(pair => pair.right?.id === option.id);

        if (isSelected) {
            setSelectedPairs(prev => prev.filter(pair => pair.right?.id !== option.id));
        } else {
            setSelectedPairs(prev => {
                const updatedPairs = [...prev];
                const firstIncompletePairIndex = updatedPairs.findIndex(pair => pair.right === null);

                if (firstIncompletePairIndex !== -1) {
                    updatedPairs[firstIncompletePairIndex].right = option;
                }

                return updatedPairs;
            });
        }
    };

    const getColorForOption = (option: AnswerOption) => {
        const matchedPair = selectedPairs.find(pair => pair.left.id === option.id || pair.right?.id === option.id);
        return matchedPair ? matchedPair.color : 'transparent';
    };

    const onSubmit = async (answer: string) => {
        setIsLoading(true); // Начинаем загрузку
        try {
            await handleSubmit(answer, task.id); // отправляем строку с выбранными ответами
        } finally {
            setIsLoading(false); // Завершаем загрузку в любом случае
        }

    };

    const disabledBtn = buttonSendText === 'Ответ принят' || isLoading; // Блокируем кнопку, если идет загрузка
    const isIncorrect = resultText === 'Решено верно' || result[task.id]?.decided;

    return (
        <View style={GlobalStyle.taskContainer}>
            <TaskHeader
                taskId={task.id}
                index={index}
                result={result}
                resultText={resultText}
            />
            {/*<View style={{*/}
            {/*    flexDirection: 'row',*/}
            {/*    alignItems: 'center',*/}
            {/*    gap: 25,*/}
            {/*    justifyContent: 'space-between',*/}
            {/*    marginBottom: 10*/}
            {/*}}>*/}
            {/*    <Text style={{color: Colors.colorGray}}>Задача {index}</Text>*/}
            {/*    /!* Отображение сообщения об ответе *!/*/}
            {/*    <Text style={{color: isIncorrect ? 'green' : 'red'}}>*/}
            {/*        {result[task.id]?.message ? result[task.id]?.message : resultText}*/}
            {/*    </Text>*/}
            {/*    /!*{task?.complexity && (*!/*/}
            {/*    /!*    <View style={{*!/*/}
            {/*    /!*        paddingHorizontal: 10,*!/*/}
            {/*    /!*        paddingVertical: 5,*!/*/}
            {/*    /!*        backgroundColor: Colors.white,*!/*/}
            {/*    /!*        borderRadius: 20*!/*/}
            {/*    /!*    }}>*!/*/}
            {/*    /!*        <Text>Сложность: {task.complexity}</Text>*!/*/}
            {/*    /!*    </View>*!/*/}
            {/*    /!*)}*!/*/}
            {/*</View>*/}

            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles.map((el) => {
                return (
                    <View key={`${el.id}${index}`}>{renderFile(el)}</View>
                )
            })}

            <MemoizedRenderHtml
                source={{html: memoizedHtml}}
                contentWidth={300}
            />
            <View style={styles.optionsContainer}>
                <View style={styles.column}>
                    {left.map((option: AnswerOption) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.option, {backgroundColor: getColorForOption(option)}]}
                            onPress={() => handleSelectLeft(option)}
                        >
                            <Text>{extractText(option.text)}</Text>
                            {/*<Text>{extractText(option.text)}</Text>*/}
                            {/*<Text>{JSON.parse(option.text)}</Text>*/}
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.column}>
                    {right.map((option: AnswerOption) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.option, {backgroundColor: getColorForOption(option)}]}
                            onPress={() => handleSelectRight(option)}
                        >
                            <Text>{extractText(option.text)}</Text>
                            {/*<Text>{extractText(option.text)}</Text>*/}
                            {/*<Text>{JSON.parse(option.text)}</Text>*/}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.matchedPairsContainer}>
                <Text style={{fontSize: 16}}>Сопоставленные пары:</Text>
                {parsedCorrectAnswer?.map((pair: { left: number, right: number }, idx: number) => {
                    const leftOption = findOptionById(left, pair.left);
                    const rightOption = findOptionById(right, pair.right);
                    return (
                        <Text key={idx} style={{ color: 'green' }}>
                            {leftOption ? extractText(leftOption.text) : 'Н/Д'} - {rightOption ? extractText(rightOption.text) : 'Н/Д'}
                        </Text>
                    );
                })}
            </View>
            <TouchableOpacity
                disabled={disabledBtn}
                onPress={() => onSubmit(JSON.stringify(answer))}
                style={[styles.answerSend,
                    {backgroundColor: buttonSendText === 'Ответ принят' ? Colors.backgroundPurpleOpacity : Colors.white}]}
            >
                {isLoading ? (
                    <ActivityIndicator/> // Отображаем лоадер, если идет загрузка
                ) : (
                    <Text>{buttonSendText}</Text> // Отображаем текст кнопки, если лоадера нет
                )}
            </TouchableOpacity>
        </View>
    );
};

export const parseAnswerOptions = (options: string) => {
    try {
        return JSON.parse(options);
    } catch (error) {
        console.error('Error parsing answer options:', error);
        return {left: [], right: []};
    }
};

const extractText = (text: string) => {
    try {
        // Пробуем парсить text как JSON, если это строка JSON
        const parsedText = JSON.parse(text);
        if (parsedText?.content) {
            // Извлекаем текст, если он существует
            return parsedText.content?.map(item => item.content?.map(contentItem => contentItem.text).join('')).join('') || '';
        }
    } catch (e) {
        // Если это не JSON, возвращаем текст напрямую
        return text;
    }
    return text;
};

// Функция для генерации пастельных цветов
export const generatePairColor = (index: number) => {
    const colors = ['#FFB6C1', '#ADD8E6', '#90EE90', '#FFD700', '#FFA07A', '#20B2AA', '#FF69B4', '#9370DB'];
    return colors[index % colors.length]; // Используем модуль для повторяющихся цветов
};

const styles = StyleSheet.create({
    taskContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    optionsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center'
    },
    column: {
        flex: 1,
        paddingHorizontal: 8,
    },
    columnTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
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
    option: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginBottom: 5
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    matchButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#00796b',
        alignItems: 'center',
        borderRadius: 8,
    },
    matchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    matchedPairsContainer: {
        marginVertical: 16,

    },
});

