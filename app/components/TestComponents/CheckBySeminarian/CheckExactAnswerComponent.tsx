import React, {useMemo} from 'react';
import {ScrollView, Text, TextInput, useWindowDimensions, View} from "react-native";
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import {Colors} from "../../../constants/Colors.ts";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import HTML from "react-native-render-html";
import {safeParse} from "../../../settings/utils.ts";
import axios from "axios";
import {convertJsonToReactComponents} from "./CheckPassWordsComponent.tsx";

type CheckExactAnswerComponentProps = {
    task: Task;
    index: number
}

const MemoizedRenderHtml = React.memo(HTML);


export const CheckExactAnswerComponent = ({task, index}: CheckExactAnswerComponentProps) => {
    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);
    const correctAnswer = safeParse(task?.correct_answer!);
    const isConstructor = correctAnswer[0]?.type === 'constructor'

    const parsedQuestion = safeParse(task.question);
    const formula = parsedQuestion?.content?.[1]?.attrs?.value.replace(/\\degree/g, '^{\\circ}').replace(/\\tg/g, '\\tan') || '';
    const { width: contentWidth} = useWindowDimensions();
    const memoizedComponents = useMemo(() => convertJsonToReactComponents(task.question), [task.question]);

    // Получаем ссылку на изображение из task
    const imageUrl = task.homeTaskFiles?.[0]?.file_path
        ? `${axios.defaults.baseURL}${task.homeTaskFiles[0].file_path}`
        : '';

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray}}>Задача {index + 1}</Text>
            {/* Отображение вопроса */}
            <ScrollView horizontal={!!formula}>
                <MemoizedRenderHtml
                    baseStyle={GlobalStyle.taskQuestion}
                    source={{html: memoizedHtml}}
                    contentWidth={contentWidth}
                />
                {/*<MathJaxSvg fontSize={16} style={GlobalStyle.formula}>*/}
                {/*    {formula}*/}
                {/*</MathJaxSvg>*/}
            </ScrollView>
            {memoizedComponents}
            {/* Отображение изображения задания */}
            {imageUrl && (
                task?.homeTaskFiles.map((el: FileData) => (
                    <View key={el.id}>
                        {renderFile(el)}
                    </View>
                ))
            )}
            <TextInput
                style={GlobalStyle.taskInput}
                placeholder={isConstructor ? 'Конструктор': 'Напишите ответ'}
                placeholderTextColor={Colors.textGray}
                editable={false}
            />
        </View>
    );
};

