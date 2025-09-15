import React, {useMemo, useState} from 'react';
import {useWindowDimensions, View} from 'react-native';
import HTML from "react-native-render-html";
import {SendAnswerComponent} from "../SendAnswerComponent/SendAnswerComponent.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {jsonConvert, safeParse} from "../../settings/utils.ts";
import MathJaxSvg from "react-native-mathjax-svg";
import {FileData} from "../../redux/slises/probeWorkSlice.ts";
import {renderFile} from "../../settings/helpers.tsx";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";
import {HomeWorkResults, Task} from "../../redux/slises/homeWorkDetailSlice.ts";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {TestResults} from "../TestResults/TestResults.tsx";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {CorrectConstructorAnswer} from "../FormulaConstructor/components/CorrectConstructorAnswer.tsx";
import {TimedTaskPrevComponent} from "../TimedTaskPrevComponent/TimedTaskPrevComponent.tsx";
import {startHomeworkTimer} from "../../redux/slises/homeworkTimerSlice.ts";
import Toast from "react-native-toast-message";


type Props = {
    task: Task;
    index: number;
    result: ResultType;
    handleSubmit: (option: string, taskId?: string) => void
    showHintCondition: boolean,
    showInput: boolean
    buttonSendText: string,
    isCompletedWork?: boolean;
    correct_answer: HomeWorkResults;
    correctAnswerHtml: string,
    showCorrectAnswer: boolean,
    resultText: string,
    url: string | null
    isTimedTask?: boolean
};
const MemoizedRenderHtml = React.memo(HTML);

export const NExactAnswerComponent = (
    {
        task,
        index,
        handleSubmit,
        showHintCondition,
        buttonSendText,
        isCompletedWork,
        result,
        url,
        correct_answer,
        resultText,
        showInput,
        correctAnswerHtml,
        isTimedTask,
        showCorrectAnswer
    }: Props) => {

    console.log(index, 'NExactAnswerComponent', task)
    const dispatch = useAppDispatch();

    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const userAnswerJson = homeWork?.homeWorkResults.find(element => element.task_id === task.id)?.answer;
    const userAnswer = jsonConvert(userAnswerJson, 'string')

    const {data: homeworkTimerData} = useAppSelector(state => state.homeworkTimer)
    const taskStarted = homeworkTimerData[task.id];

    const [isLoading, setIsLoading] = useState(false);
    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);
    const {width: contentWidth} = useWindowDimensions();

    const imageUrl = task.homeTaskFiles?.[0]?.file_path
        ? `${url}${task.homeTaskFiles[0].file_path}`
        : '';

    const onSubmit = async (answer: string) => {
        setIsLoading(true);
        try {
            await handleSubmit(answer, task.id.toString());
        } finally {
            setIsLoading(false);
        }
    };

    const parsedQuestion = safeParse(task.question);
    const correctAnswer = safeParse(task?.correct_answer!);
    const isConstructor = correctAnswer[0]?.type === 'constructor'

    const formula = parsedQuestion?.content?.find((item: any) => item.type === 'math')?.attrs?.value.replace(/\\degree/g, '^{\\circ}').replace(/\\tg/g, '\\tan') || '';
    const showCorrectAnswer2 = buttonSendText === 'Ответ принят' && (resultText === 'Решено неверно' || resultText === 'Не верный ответ');
    const showCorrectAnswers = buttonSendText === 'Ответ принят'
    const isDisabledConstructor = isConstructor && showCorrectAnswers
    const disabledBtn = buttonSendText === 'Ответ принят';

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
                disabledBtn && !isTimedTask
                    ? <>
                        <TaskHeader
                            index={index}
                            complexity={task?.complexity!}
                            resultText={resultText}
                            taskId={task.id}
                            result={result}
                        />
                        <MemoizedRenderHtml
                            baseStyle={GlobalStyle.taskQuestion}
                            source={{html: memoizedHtml}}
                            contentWidth={contentWidth}
                        />
                        {formula && (
                            <MathJaxSvg fontSize={16}
                                        style={GlobalStyle.formula}
                            >
                                {formula}
                            </MathJaxSvg>
                        )}


                        {imageUrl && task.homeTaskFiles.map((el: FileData) => (
                            <View key={el.id}>
                                {renderFile(el)}
                            </View>
                        ))}

                        {
                            isCompletedWork
                                ? <TestResults
                                    correct_answer={correct_answer}
                                    taskType={task.type}
                                />
                                : <SendAnswerComponent
                                    userAnswer={userAnswer}
                                    isDisabledConstructor={isDisabledConstructor}
                                    loading={isLoading}
                                    buttonTitle={buttonSendText}
                                    showInput={showInput}
                                    hint={task?.prompt!}
                                    handleSubmit={onSubmit}
                                    showHintCondition={showHintCondition}
                                    taskId={task?.id}
                                    isConstructor={isConstructor}
                                    correctAnswerHtml={correctAnswerHtml}
                                    showCorrectAnswer={showCorrectAnswer2}
                                />
                        }

                    </>


                    : isTimedTask && !taskStarted
                        ? <TimedTaskPrevComponent
                            index={index}
                            complexity={task?.complexity!}
                            resultText={resultText}
                            taskId={task.id}
                            result={result}
                            taskStarted={taskStarted!}
                            startTaskHandler={startTaskHandler}
                            isLoading={isLoading}
                        />

                        : <>
                            <TaskHeader
                                taskId={task.id}
                                index={index}
                                result={result}
                                resultText={resultText}
                                taskStarted={taskStarted!}
                            />

                            <MemoizedRenderHtml
                                baseStyle={GlobalStyle.taskQuestion}
                                source={{html: memoizedHtml}}
                                contentWidth={contentWidth}
                            />
                            {formula && (
                                <MathJaxSvg fontSize={16}
                                            style={GlobalStyle.formula}
                                >
                                    {formula}
                                </MathJaxSvg>
                            )}


                            {imageUrl && task.homeTaskFiles.map((el: FileData) => (
                                <View key={el.id}>
                                    {renderFile(el)}
                                </View>
                            ))}

                            {
                                isCompletedWork
                                    ? <TestResults
                                        correct_answer={correct_answer}
                                        taskType={task.type}
                                    />
                                    : <SendAnswerComponent
                                        userAnswer={userAnswer}
                                        isDisabledConstructor={isDisabledConstructor}
                                        loading={isLoading}
                                        buttonTitle={buttonSendText}
                                        showInput={showInput}
                                        hint={task?.prompt!}
                                        handleSubmit={onSubmit}
                                        showHintCondition={showHintCondition}
                                        taskId={task?.id}
                                        isConstructor={isConstructor}
                                        correctAnswerHtml={correctAnswerHtml}
                                        showCorrectAnswer={showCorrectAnswer2}
                                    />
                            }

                            <CorrectConstructorAnswer
                                showCorrectAnswers={showCorrectAnswers}
                                correctAnswer={correctAnswer}
                                isConstructor={isConstructor}
                            />
                        </>
            }
        </View>
    );
};



const convertJsonToHtml = (jsonString: string): string => {
    if (!jsonString) return '';
    let obj;
    try {
        obj = JSON.parse(jsonString);
    } catch {
        return jsonString; // если это не JSON
    }

    const renderNode = (node: any): string => {
        if (!node) return '';

        if (node.type === 'doc' || node.type === 'paragraph') {
            const content = (node.content || []).map(renderNode).join('');
            return `<p style="margin:6px 0;">${content}</p>`;
        }

        if (node.type === 'text') {
            let text = node.text || '';
            (node.marks || []).forEach((mark: any) => {
                switch (mark.type) {
                    case 'bold':
                        text = `<b>${text}</b>`;
                        break;
                    case 'italic':
                        text = `<i>${text}</i>`;
                        break;
                    case 'underline':
                        text = `<u>${text}</u>`;
                        break;
                    case 'textStyle':
                        if (mark.attrs?.color) {
                            text = `<span style="color:${mark.attrs.color}">${text}</span>`;
                        }
                        break;
                    case 'link':
                        if (mark.attrs?.href) {
                            text = `<a href="${mark.attrs.href}" style="color:#2980b9;text-decoration:underline;">${text}</a>`;
                        }
                        break;
                }
            });
            return text;
        }

        if (node.type === 'hardBreak') {
            return '<br/>';
        }

        return '';
    };

    return renderNode(obj);
};