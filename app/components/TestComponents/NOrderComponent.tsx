import {FlatList, StyleSheet, Text, View} from 'react-native';
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {Colors} from "../../constants/Colors.ts";
import React, {useState} from "react";
import {SendAnswerComponent} from "../SendAnswerComponent/SendAnswerComponent.tsx";
import HTML from "react-native-render-html";
import {convertJsonToHtml, renderFile} from "../../settings/helpers.tsx";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";
import {FileData} from "../../redux/slises/probeWorkSlice.ts";


type Props = {
    task: any;
    index: number;
    result: ResultType;
    handleSubmit: (answer: string, taskId?: string) => void
    showHintCondition: boolean,
    correct_answer: HomeWorkResults;
    showInput: boolean
    buttonSendText: string,
    correctAnswerHtml: string,
    showCorrectAnswer: boolean,
    resultText: string
}

export const NOrderComponent = (
    {
        task,
        index,
        result,
        handleSubmit,
        resultText,
        showHintCondition,
        correct_answer,
        buttonSendText,
        showInput,
        correctAnswerHtml,
        showCorrectAnswer
    }: Props) => {
    console.log(index, 'NOrderComponent', showCorrectAnswer)

    const parsedQuestion = JSON.parse(task.question); // Парсим JSON
    const listItems = parsedQuestion?.content.find((item: any) => item.type === 'orderedList')?.content; // Извлекаем список
    const [isLoading, setIsLoading] = useState(false); // Добавляем состояние для отслеживания загрузки

    const isIncorrect = resultText === 'Решено верно' || result[task.id]?.decided;

    const onSubmit = async (answer: string) => {
        setIsLoading(true); // Начинаем загрузку
        try {
            await handleSubmit(answer, task.id); // Ждем завершения отправки
        } finally {
            setIsLoading(false); // Завершаем загрузку в любом случае
        }

    };

    return (
        <View style={GlobalStyle.taskContainer}>
            <TaskHeader
                index={index}
                complexity={task?.complexity}
                resultText={resultText}
                taskId={task.id}
                result={result}
            />
            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles.map((el: FileData) => (renderFile(el)))}


            {/* Вопрос */}
            <HTML
                baseStyle={{paddingBottom: 0, fontSize: 16, marginBottom: 10}}
                source={{html: convertJsonToHtml(task.question)}}
                contentWidth={300}
            />

            {/* Список утверждений */}
            <FlatList
                data={listItems}
                style={{marginBottom: 15}}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                    <Text style={styles.questionItem}>{index + 1}. {item.content[0].content[0].text}</Text>
                )}
            />

            {/* Поле для ввода ответа */}
            <SendAnswerComponent
                buttonTitle={buttonSendText}
                showInput={showInput}
                hint={task?.prompt}
                loading={isLoading}
                handleSubmit={onSubmit}
                showHintCondition={showHintCondition}
                taskId={task?.id}
                correctAnswerHtml={correctAnswerHtml}
                showCorrectAnswer={showCorrectAnswer}
            />

            {showCorrectAnswer &&
                (result[task.id]?.correct_answer || correct_answer?.correct_answer) && <View style={{flex: 1}}>
                    <Text style={[styles.answerBlock, {
                        backgroundColor: Colors.colorAccentRGB
                    }]}>Правильный ответ</Text>
                    <Text style={[styles.answerBlock, {
                        backgroundColor: Colors.white,
                        color: Colors.colorBlack
                    }]}>{result[task.id]?.correct_answer ? result[task.id]?.correct_answer : correct_answer?.correct_answer}
                    </Text>
                </View>
            }

        </View>
    );
};

const styles = StyleSheet.create({
    answerBlock: {
        //  width: '50%',
        backgroundColor: Colors.colorAccentFirst,
        borderRadius: 10,
        padding: 8,
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 7,
        fontSize: 16
    },
    questionText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    questionItem: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    }

});
