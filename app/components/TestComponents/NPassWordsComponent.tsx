import React, {useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import HTML from "react-native-render-html";
import {Colors} from "../../constants/Colors.ts";

import {Task} from "../../redux/slises/homeworkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../settings/helpers.tsx";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import getResultText, {jsonConvert, safeParse} from "../../settings/utils.ts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";
import Constructor from "../FormulaConstructor/Constructor.tsx";
import {FormulaItem} from "../FormulaConstructor/constans.ts";
import {CorrectConstructorAnswer} from "../FormulaConstructor/components/CorrectConstructorAnswer.tsx";
import {startHomeworkTimer} from "../../redux/slises/homeworkTimerSlice.ts";
import Toast from "react-native-toast-message";
import {TimedTaskPrevComponent} from "../TimedTaskPrevComponent/TimedTaskPrevComponent.tsx";
import MathJaxSvg from "react-native-mathjax-svg";


export type AnswerOption = {
    answer: number;
    index: number;
    question: string;
    type: string;
};

export type CorrectAnswer = {
    text: string;
    index: number;
};

type UserAnswerTpe = {
    type: "constructor",
    value: FormulaItem[]
}

type Props = {
    task: Task;

    index: number;
    result: ResultType;
    correct_answer: HomeWorkResults;
    buttonSendText: string,
    handleSubmit: (option: string, taskId?: string) => void
    resultText: string
    isCompletedWork?: boolean
    isTimedTask?: boolean
};

export type UserAnswerSend = {
    text: string;
};
const MemoizedRenderHtml = React.memo(HTML);

export const NPassWordsComponent = (
    {
        task,
        index,
        isCompletedWork,
        result,
        correct_answer,
        resultText,
        buttonSendText,
        handleSubmit,
        isTimedTask
    }: Props) => {
    console.log(index, 'NPassWordsComponent', task)
    const dispatch = useAppDispatch();
    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const userAnswerJson = homeWork?.homeWorkResults.find(element => element.task_id === task.id)?.answer;
    const userAnswer = jsonConvert(userAnswerJson, 'string')

    const {data: homeworkTimerData} = useAppSelector(state => state.homeworkTimer)
    const taskStarted = homeworkTimerData[task.id];

    const [userAnswers, setUserAnswers] = useState<UserAnswerSend[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Состояние для лоадера

    const [formulaValuesByIndex, setFormulaValuesByIndex] = useState<FormulaItem[][]>(
        Array.isArray(userAnswer)
            ? userAnswer.map((ans: any) => (Array.isArray(ans?.text) ? ans.text : []))
            : []
    );

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);
    const correctAnswer = safeParse(task?.correct_answer!);
    const isConstructor = correctAnswer.some((item) => item.type === "constructor");
    const answerOptions: AnswerOption[] = JSON.parse(task?.answer_options);
    const userAnswerList = correct_answer?.answer ? JSON.parse(correct_answer.answer) : [];
    const correctAnswerList = correct_answer?.correct_answer ? JSON.parse(correct_answer.correct_answer) : [];
    const disabledBtn = buttonSendText === 'Ответ принят' || isLoading;
    const showCorrectAnswers = buttonSendText === 'Ответ принят'

    const updateFormulaAnswer = (index: number, value: FormulaItem[]) => {
        const updated = [...formulaValuesByIndex];
        updated[index] = value;
        setFormulaValuesByIndex(updated);
    };

    const combinedAnswers = answerOptions.map((option, idx) => {
        if (option.type === 'constructor') {
            return {text: formulaValuesByIndex[idx] ?? []};
        } else {
            return {text: userAnswers[idx]?.text ?? ''};
        }
    });


    // Функция для обновления ответов
    const updateAnswer = (index: number, text: string) => {
        const updatedAnswers = [...userAnswers];
        if (updatedAnswers[index]) {
            updatedAnswers[index].text = text;
        } else {
            updatedAnswers[index] = {text};
        }
        setUserAnswers(updatedAnswers);
    };

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            const answer = JSON.stringify(combinedAnswers); // <-- вот здесь
            await handleSubmit(answer, task.id.toString());
        } finally {
            setIsLoading(false);
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
                        ? <TimedTaskPrevComponent
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
                                taskId={task.id}
                                index={index}
                                result={result}
                                resultText={resultText}
                                taskStarted={taskStarted!}
                            />

                            {/* Отображение картинки или аудио */}
                            {task?.homeTaskFiles.map((el) => {
                                return (
                                    <View key={`${el.id}${index}`}>{renderFile(el)}</View>
                                )
                            })}

                            <MemoizedRenderHtml
                                baseStyle={GlobalStyle.taskQuestion}
                                source={{html: memoizedHtml}}
                                contentWidth={300}
                            />

                            {answerOptions.map((option, idx) => {
                                const isDisabledConstructor = option.type === 'constructor' && showCorrectAnswers
                                return (
                                    <View key={`${option.answer}-${idx}`} style={styles.answerRow}>
                                        <Text style={styles.questionPart}>{renderQuestionContent(option.question)}</Text>
                                        {
                                            option.type === 'constructor' ?
                                                <Constructor
                                                    value={Array.isArray(formulaValuesByIndex[idx]) ? formulaValuesByIndex[idx] : []}
                                                    edit={(items) => updateFormulaAnswer(idx, items)}
                                                    prohibitEditing={isDisabledConstructor}
                                                    validate={false}
                                                    name="formula"
                                                /> :
                                                <TextInput
                                                    style={GlobalStyle.taskInput}
                                                    placeholder="Напишите ответ"
                                                    placeholderTextColor={Colors.textGray}
                                                    onChangeText={(text) => updateAnswer(idx, text)}
                                                    value={
                                                        isCompletedWork
                                                            ? userAnswerList[idx]?.text || '' // Отображаем ответ пользователя, если работа завершена
                                                            : userAnswers[idx]?.text || ''    // Если работа не завершена, ввод возможен
                                                    }
                                                    editable={!isCompletedWork} // Блокируем ввод, если работа завершена
                                                />
                                        }
                                    </View>
                                )
                            })}

                            {!isCompletedWork && (
                                <TouchableOpacity
                                    disabled={disabledBtn}
                                    onPress={() => onSubmit(JSON.stringify(userAnswers))}
                                    style={[GlobalStyle.taskAnswerBtn,
                                        {
                                            backgroundColor: buttonSendText === 'Ответ принят'
                                                ? Colors.backgroundPurpleOpacity
                                                : Colors.white
                                        }]}>
                                    {isLoading ? <ActivityIndicator/> : <Text>{buttonSendText}</Text>}
                                </TouchableOpacity>
                            )}

                            <CorrectConstructorAnswer
                                showCorrectAnswers={showCorrectAnswers}
                                correctAnswer={correctAnswer}
                                isConstructor={isConstructor}
                            />
                            {isCompletedWork && (
                                <View style={styles.correctAnswersContainer}>
                                    <Text style={{fontWeight: 'bold', marginTop: 10}}>Правильные ответы:</Text>
                                    {correctAnswerList.map((correct, idx) => (
                                        <Text key={idx} style={{color: 'green'}}>
                                            {correct.index}. {correct.text}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </>
            }


        </View>
    );
};

export const renderQuestionContent = (question: any) => {
    return question.content.map((block: any, index: number) => {
        if (block.type === 'paragraph') {
            return (
                <Text key={index} style={{fontSize: 16}}>
                    {block.content?.map((item: any) => item.text).join(' ')}
                </Text>
            );
        }

        if (block.type === 'math') {
            return (
                <MathJaxSvg
                    key={index}
                 //   math={block.attrs?.value || ''}
                    style={{ marginVertical: 8 }}
                >
                    {block.attrs?.value}
                </MathJaxSvg>
            );
        }

        return null;
    });
};

export const extractText = (node: any): string => {
    if (!node) return '';
    if (Array.isArray(node)) {
        return node.map(extractText).join('');
    }
    if (typeof node === 'object') {
        if (node.text) return node.text;
        if (node.content) return extractText(node.content);
    }
    return '';
};

const styles = StyleSheet.create({
    answerRow: {
        flex: 1,
        flexDirection: 'column',
        // alignItems: 'center',
        marginBottom: 5,
    },
    questionPart: {
        flex: 1,
        fontSize: 14,
    },
    correctAnswersContainer: {}

});
