import React, {useMemo} from 'react';
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Colors} from "../../../constants/Colors.ts";
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import HTML from "react-native-render-html";
import {AnswerOption, parseAnswerOptions} from "../NMatchComponent.tsx";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import {extractText} from "../ViewHomeWork/ViewMatchAnswerHomeWork.tsx";

type CheckMatchComponentProps = {
    task: Task;
    index: number
}

const MemoizedRenderHtml = React.memo(HTML);

export const CheckMatchComponent = ({task, index}: CheckMatchComponentProps) => {

    const {left = [], right = []} = task.answer_options;

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray}}>Задача {index + 1}</Text>
            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles?.map((el) => {
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
                            disabled={true}
                            style={[styles.option]}
                        >
                            <Text>{extractText(option.text)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.column}>
                    {right.map((option: AnswerOption) => (
                        <TouchableOpacity
                            key={option.id}
                            disabled={true}
                            style={[styles.option]}
                        >
                            <Text>{extractText(option.text)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>


        </View>
    );
};

const styles = StyleSheet.create({
    optionsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center'
    },
    column: {
        flex: 1,
        paddingHorizontal: 8,
    },
    option: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginBottom: 5
    },
});