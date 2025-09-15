import React, {useEffect, useMemo, useState} from 'react';
import {useWindowDimensions, View} from "react-native";
import {TaskHeader} from "../../TaskHeader/TaskHeader.tsx";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {SendAnswerComponent} from "../../SendAnswerComponent/SendAnswerComponent.tsx";
import HTML from "react-native-render-html";
import getResultText from "../../../settings/utils.ts";
import {useAppSelector} from "../../../redux/hooks.ts";
import {Colors} from "../../../constants/Colors.ts";

const MemoizedRenderHtml = React.memo(HTML);

type Props = {
    task: any,
    index: number,
    buttonSendText: string,
    showInput: boolean,
    showHintCondition: boolean,
    showCorrectAnswer: boolean,
    correctAnswerHtml: string,
    handleSubmit: (answer: string, taskId: string) => void
}
export const MultipleChoiceControlWorkComponent = (
    {
        task,
        index,
        handleSubmit,
        showInput,
        buttonSendText
    }: Props) => {
    const {width: contentWidth} = useWindowDimensions();
    const {result} = useAppSelector((state) => state.sendControlWorkAnswer);
    const {data: controlWork} = useAppSelector(state => state.controlWork);

    const [isLoading, setIsLoading] = useState(false);
    const [resultText, setResultText] = useState('');
    const correct_answer = controlWork?.controlWorkResults.find(el => el.task_id === task.id)
    //  console.log(index, correct_answer)

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);

    useEffect(() => {
        // @ts-ignore
        const newText = getResultText(result, task.id, {score: correct_answer?.score});
        setResultText(newText);
    }, [result, task.id, correct_answer]);

    const onSubmit = async (answer: string) => {
        setIsLoading(true);
        try {
            await handleSubmit(answer, task.id);
        } finally {
            setIsLoading(false);
        }

    };

    const showHintCondition2 = !!result[task.id]?.prompt
    const showCorrectAnswer2 = !!result[task.id]?.correct_answer || !!correct_answer?.correct_answer
    const correctAnswerHtml2 = result[task.id]?.correct_answer || correct_answer?.correct_answer || '';


    return (
        <View style={GlobalStyle.taskContainer}>
            <TaskHeader
                index={index}
                complexity={task?.complexity}
                resultText={resultText}
                taskId={task.id}
                result={result}
            />

            <MemoizedRenderHtml
                baseStyle={GlobalStyle.taskQuestion}
                source={{html: memoizedHtml}}
                contentWidth={contentWidth}
            />

            <SendAnswerComponent
                buttonTitle={buttonSendText}
                showInput={showInput}
                loading={isLoading}
                hint={task?.prompt}
                handleSubmit={onSubmit}
                showHintCondition={showHintCondition2}
                taskId={task?.id}
                correctAnswerHtml={correctAnswerHtml2}
                showCorrectAnswer={showCorrectAnswer2}
            />

        </View>
    );
};

const convertJsonToHtml = (json: any) => {
    const convert = JSON.parse(json)
    const parseNode = (node: any): string => {

        switch (node.type) {
            case 'doc':
                return node?.content?.map(parseNode).join('');
            case 'heading':
                return `<h${node.attrs.level} style="margin: 0; padding: 0;">${node?.content?.map(parseNode).join('')}</h${node.attrs.level}>`;
            case 'paragraph':
                if (node?.content?.length > 0) {
                    return `<p style="margin: 0; padding: 2px;">${node?.content?.map(parseNode).join('')}</p>`;
                }

            case 'text':
                return node.text;
            default:
                return '';
        }
    };

    return parseNode(convert);
};

