import {StyleSheet, useWindowDimensions, View} from 'react-native';
import React, {useMemo, useState} from "react";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import HTML from "react-native-render-html";
import {SendAnswerComponent} from "../SendAnswerComponent/SendAnswerComponent.tsx";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";
import {Colors} from "../../constants/Colors.ts";
import {TestResults} from "../TestResults/TestResults.tsx";
import {FileData} from "../../redux/slises/probeWorkSlice.ts";
import {renderFile} from "../../settings/helpers.tsx";

type Props = {
    task: any,
    index: number,
    buttonSendText: string,
    resultText: string,
    correct_answer: HomeWorkResults;
    result: ResultType;
    showInput: boolean,
    showHintCondition: boolean,
    showCorrectAnswer: boolean,
    correctAnswerHtml: string,
    isCompletedWork?: boolean
    handleSubmit: (answer: string, taskId?: string) => void
}
const MemoizedRenderHtml = React.memo(HTML);

export const NMultipleChoiceComponent = (
    {
        task,
        result,
        resultText,
        correct_answer,
        isCompletedWork,
        correctAnswerHtml,
        index,
        showCorrectAnswer,
        handleSubmit,
        showHintCondition,
        showInput,

        buttonSendText
    }: Props) => {
    console.log(index, 'NMultipleChoiceComponent')

    const {width: contentWidth} = useWindowDimensions();
    const [isLoading, setIsLoading] = useState(false);

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);
    const showHintCondition2 = !!result[task.id]?.prompt
    const showCorrectAnswer2 = !!result[task.id]?.correct_answer || !!correct_answer?.correct_answer
    const correctAnswerHtml2 = result[task.id]?.correct_answer || correct_answer?.correct_answer || '';


    const onSubmit = async (answer: string) => {
        setIsLoading(true);
        try {
            await handleSubmit(answer, task.id);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={GlobalStyle.taskContainer}>
            <TaskHeader
                index={index}
                complexity={task?.complexity}
                resultText={resultText}
                result={result}
                taskId={task.id}
            />
            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles.map((el: FileData) => (renderFile(el)))}

            <MemoizedRenderHtml
                baseStyle={GlobalStyle.taskQuestion}
                source={{html: memoizedHtml}}
                contentWidth={contentWidth}
            />

            {
                isCompletedWork
                    ? <TestResults
                        correct_answer={correct_answer}
                        taskType={task.type}
                    />
                    : <SendAnswerComponent
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
            }
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
})

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
