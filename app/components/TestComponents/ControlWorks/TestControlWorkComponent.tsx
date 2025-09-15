import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {Colors} from "../../../constants/Colors.ts";
import getResultText, {getTextColor, safeParse} from "../../../settings/utils.ts";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import HTML from "react-native-render-html";
import MathJaxSvg from "react-native-mathjax-svg";
import {useAppSelector} from "../../../redux/hooks.ts";

type Props = {
    task: any,
    index: number,
    buttonSendText: string,
    handleSubmit: (answer: string, taskId: string) => void // изменено: массив ответов
}

export const TestControlWorkComponent = (
    {
        task,
        index,
        buttonSendText,
        handleSubmit
    }: Props) => {

    const answerOptions = JSON.parse(task.answer_options);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]); // изменено: массив выбранных опций

    const {data: controlWork} = useAppSelector(state => state.controlWork);
    const correct_answer = controlWork?.controlWorkResults.find(el => el.task_id === task.id);

    const {result} = useAppSelector((state) => state.sendControlWorkAnswer);
    const [resultText, setResultText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const parsedQuestion = safeParse(task.question);
    const formula = parsedQuestion?.content?.find((form: any) => form.type === 'math')?.attrs?.value || '';

    // Устанавливаем выбранные опции из correct_answer при загрузке компонента
    useEffect(() => {
        if (correct_answer?.answer) {
            // Если ответ это строка с индексами выбранных опций, например "1,2", преобразуем её в массив
            const savedAnswer = correct_answer.answer.split(',').map(Number);
            setSelectedOptions(savedAnswer);
        }
    }, [correct_answer]);

    useEffect(() => {
        if (result[task.id]?.decided) {
            setResultText(result[task.id]?.message)
            return;
        }
        if (correct_answer?.decided_right === 1) {
            setResultText('Решено верно');
        } else {
            setResultText('Решено неверно');
        }
    }, [result, correct_answer]);

    const handleSelectOption = (index: number) => {
        setSelectedOptions(prevSelected => {
            if (prevSelected.includes(index)) {
                // Если опция уже выбрана, снимаем выбор
                return prevSelected.filter(option => option !== index);
            } else {
                // Если опция не выбрана, добавляем её
                return [...prevSelected, index];
            }
        });
    };

    const submitHandler = async () => {
        if (selectedOptions.length > 0) {
            const answer = JSON.stringify(selectedOptions.map(option => String(option))); // массив выбранных ответов
            setIsLoading(true);
            try {
                await handleSubmit(answer, task.id); // отправляем массив ответов
            } finally {
                setIsLoading(false);
            }
        }
    };

    const showCorrectAnswer = !result[task.id]?.decided || correct_answer?.decided_right !== 1

    return (
        <View style={GlobalStyle.taskContainer}>
            <View style={styles.headerContainer}>
                <Text style={{color: Colors.colorGray}}>Задача {index}</Text>
                <Text style={{color: getTextColor(result[task.id]?.message ? result[task.id]?.message : resultText)}}>
                    {result[task.id]?.message ? result[task.id]?.message : resultText}
                </Text>
            </View>

            {task?.homeTaskFiles && task?.homeTaskFiles.length > 0 &&
                task?.homeTaskFiles.map((el: FileData) => renderFile(el))
            }

            {task?.question &&
                <HTML
                    baseStyle={GlobalStyle.taskQuestion}
                    source={{html: convertJsonToHtml(task.question)}}
                    contentWidth={300}
                />
            }

            {!!formula && <MathJaxSvg fontSize={16} style={styles.mathFormula}>
                {`${formula}`}
            </MathJaxSvg>}

            {answerOptions?.map((option: any) => (
                <TouchableOpacity
                    key={option.index}
                    onPress={() => handleSelectOption(option.index)}
                    style={styles.optionContainer}
                >
                    <View style={styles.checkbox}>
                        {selectedOptions.includes(option.index) && (
                            <View style={styles.checkboxSelected}/>
                        )}
                    </View>

                    {typeof option.text === 'string' ? (
                        <Text style={styles.optionText}>{option.text}</Text>
                    ) : (
                        option?.text.content?.map((item: any, i: number) => {
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
                    )}
                </TouchableOpacity>
            ))}

            {showCorrectAnswer && correct_answer?.correct_answer && (
                <View style={{flex: 1}}>
                    <Text style={[styles.answerBlock, {backgroundColor: Colors.colorAccentRGB}]}>
                        Правильный ответ
                    </Text>
                    <Text style={[styles.answerBlock, {backgroundColor: Colors.white, color: Colors.colorBlack}]}>
                        {correct_answer?.correct_answer}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                disabled={buttonSendText === 'Ответ принят'}
                onPress={submitHandler}
                style={[GlobalStyle.taskAnswerBtn, {
                    backgroundColor: buttonSendText === 'Ответ принят' ? Colors.colorAccentFirst : Colors.white
                }]}>
                {
                    isLoading
                        ? <ActivityIndicator/>
                        : <Text style={{color: buttonSendText === 'Ответ принят' ? Colors.white : Colors.colorBlack}}>
                            {buttonSendText}
                        </Text>
                }
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'space-between',
        marginBottom: 15
    },

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
