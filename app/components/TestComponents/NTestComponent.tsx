import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from "../../constants/Colors.ts";

import {safeParse} from "../../settings/utils.ts";
import MathJaxSvg from "react-native-mathjax-svg";
import {renderFile} from "../../settings/helpers.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";
import {TestResults} from "../TestResults/TestResults.tsx";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";

type Props = {
    task: any;
    index: number,
    result: ResultType;
    resultText: string;
    correct_answer: HomeWorkResults;
    handleSubmit: (option: string, taskId?: string) => void
    buttonSendText: string
    showCorrectAnswer: boolean
    isCompletedWork?: boolean
};

export const NTestComponent = (
    {
        task,
        index,
        result,
        correct_answer,
        isCompletedWork,
        resultText,
        buttonSendText,
        handleSubmit,
        showCorrectAnswer,
    }: Props) => {
    console.log(index, 'NTestComponent')

    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const answerOptions = JSON.parse(task.answer_options);
    const parsedQuestion = safeParse(task.question);

    const handleSelectOption = (optionIndex: number) => {
        setSelectedOptions(prevSelected =>
            prevSelected.includes(optionIndex)
                ? prevSelected.filter(option => option !== optionIndex)
                : [...prevSelected, optionIndex]
        );
    };

    const submitHandler = async () => {
        if (selectedOptions.length > 0) {
            const answer = selectedOptions.join(',');
            setIsLoading(true);
            try {
                await handleSubmit(answer, task.id);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <View style={GlobalStyle.taskContainer}>
            <TaskHeader
                taskId={task.id}
                index={index}
                result={result}
                resultText={resultText}
            />


            {/* Отображение изображений */}
            {task?.homeTaskFiles?.map(el => renderFile(el))}

            {/* Отображение вопроса */}
            {parsedQuestion?.content?.map((item, i) => {
                if (item.type === 'paragraph') {
                    return (
                        <Text key={i} style={GlobalStyle.taskQuestion}>
                            {item.content.map(subItem => subItem.text).join('')}
                        </Text>
                    );
                } else if (item.type === 'math') {
                    return (
                        <MathJaxSvg key={i} fontSize={16} style={styles.mathFormula}>
                            {`${item.attrs.value}`}
                        </MathJaxSvg>
                    );
                }
                return null;
            })}

            {/* Отображение вариантов ответов */}
            {Array.isArray(answerOptions) && answerOptions.map(option => (
                <TouchableOpacity
                    key={option.index}
                    onPress={() => handleSelectOption(option.index)}
                    style={[styles.optionContainer, { opacity: buttonSendText === 'Ответ принят' ? 0.5 : 1 }]}
                    disabled={buttonSendText === 'Ответ принят'}
                >
                    <View style={styles.checkbox}>
                        {selectedOptions.includes(option.index) && (
                            <View style={styles.checkboxSelected} />
                        )}
                    </View>

                    {/* Отображение текста и формул для каждого варианта */}
                    {typeof option.text === 'string' ? (
                        <Text style={styles.optionText}>{option.text}</Text>
                    ) : (
                        option.text.content.map((item, i) => {
                            if (item.type === 'math') {
                                return (
                                    <MathJaxSvg key={i} fontSize={16}>
                                        {`$${item.attrs.value}$`}
                                    </MathJaxSvg>
                                );
                            } else {
                                return (
                                    <Text key={i} style={styles.optionText}>
                                        {item.content?.map(subItem => subItem.text).join('')}
                                    </Text>
                                );
                            }
                        })
                    )}
                </TouchableOpacity>
            ))}

            {/* Кнопка отправки ответа */}
            {isCompletedWork ? (
                <TestResults correct_answer={correct_answer} taskType={task.type}/>
            ) : (
                <>
                    {showCorrectAnswer && correct_answer?.correct_answer && (
                        <View style={{flex: 1}}>
                            <Text style={[styles.answerBlock, {backgroundColor: Colors.colorAccentRGB}]}>
                                Правильный ответ
                            </Text>
                            <Text
                                style={[styles.answerBlock, {backgroundColor: Colors.white, color: Colors.colorBlack}]}>
                                {correct_answer?.correct_answer}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        disabled={buttonSendText === 'Ответ принят'}
                        onPress={submitHandler}
                        style={[GlobalStyle.taskAnswerBtn, {
                            backgroundColor: buttonSendText === 'Ответ принят' ? Colors.colorAccentFirst : Colors.white
                        }]}
                    >
                        {isLoading ? (
                            <ActivityIndicator/>
                        ) : (
                            <Text style={{color: buttonSendText === 'Ответ принят' ? Colors.white : Colors.colorBlack}}>
                                {buttonSendText}
                            </Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    answerBlock: {
        backgroundColor: Colors.colorAccentFirst,
        borderRadius: 10,
        padding: 8,
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 7,
        fontSize: 16
    },
    mathFormula: {
        marginBottom: 15,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkbox: {
        height: 20,
        width: 20,
        //  borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.colorAccent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    checkboxSelected: {
        height: 20,
        width: 20,
        // borderRadius: 10,
        backgroundColor: Colors.colorAccent,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
    },
});
