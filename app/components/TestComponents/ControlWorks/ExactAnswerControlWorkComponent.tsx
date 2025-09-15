import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, Text, useWindowDimensions, View} from "react-native";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {Colors} from "../../../constants/Colors.ts";
import MathJaxSvg from "react-native-mathjax-svg";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import {SendAnswerComponent} from "../../SendAnswerComponent/SendAnswerComponent.tsx";
import {useAppSelector} from "../../../redux/hooks.ts";
import getResultText, {safeParse} from "../../../settings/utils.ts";
import HTML from "react-native-render-html";
import axios from "axios";

const MemoizedRenderHtml = React.memo(HTML);

type Props = {
    task: any,
    index: number,
    buttonSendText: string,
    showInput: boolean,
    correct_answerHtml: string,
    handleSubmit: (answer: string, taskId: string) => void

}
export const ExactAnswerControlWorkComponent = (
    {
        task,
        index,
        buttonSendText,
        showInput,
        correct_answerHtml,
        handleSubmit
    }: Props) => {
    const { width: contentWidth} = useWindowDimensions();
    const {result} = useAppSelector((state) => state.sendControlWorkAnswer);
    const {data: controlWork} = useAppSelector(state => state.controlWork);
    const correct_answer = controlWork?.controlWorkResults.find(el => el.task_id === task.id)
    const [resultText, setResultText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isIncorrect = resultText === 'Решено верно' || result[task.id]?.decided;
   // const showCorrectAnswer2=  buttonSendText === 'Ответ принят' && (resultText === 'Решено неверно' || resultText === 'Не верный ответ')

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);

    const parsedQuestion = safeParse(task.question);
    const formula = parsedQuestion?.content?.find((form: any) => form.type === 'math')?.attrs?.value || ''
    const showCorrectAnswer2=  buttonSendText === 'Ответ принят' && (resultText === 'Решено неверно' || resultText === 'Не верный ответ')

    const imageUrl = task.homeTaskFiles?.[0]?.file_path
        ? `${axios.defaults.baseURL}${task.homeTaskFiles[0].file_path}`
        : '';

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

    return (
        <View style={GlobalStyle.taskContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 25}}>
                <Text style={{color: Colors.colorGray}}>Задача {index}</Text>
                {/* Отображение сообщения об ответе */}
                <Text style={{color: isIncorrect ? 'green' : 'red'}}>
                    {result[task.id]?.message ? result[task.id]?.message : resultText}
                </Text>
            </View>

            {/* Отображение вопроса */}
            <ScrollView horizontal={!!formula}>
                <MemoizedRenderHtml
                    baseStyle={GlobalStyle.taskQuestion}
                    source={{html: memoizedHtml}}
                    contentWidth={contentWidth}
                />
                <MathJaxSvg fontSize={16} style={GlobalStyle.formula}>
                    {formula}
                </MathJaxSvg>
            </ScrollView>

            {/* Отображение изображения задания */}
            {imageUrl && (
                task?.homeTaskFiles.map((el: FileData) => (
                    <View key={el.id}>
                        {renderFile(el)}
                    </View>
                ))
            )}

            {/*/!* Поле для ввода ответа *!/*/}
            <SendAnswerComponent
                loading={isLoading}
                buttonTitle={buttonSendText}
                showInput={showInput}
                hint={task?.prompt}
                handleSubmit={onSubmit}
              //  showHintCondition={showHintCondition}
                taskId={task?.id}
                correctAnswerHtml={correct_answerHtml}
                showCorrectAnswer={showCorrectAnswer2}
            />
        </View>
    );
};
