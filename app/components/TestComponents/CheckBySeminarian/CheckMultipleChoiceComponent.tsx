import React, {useMemo} from 'react';
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {Text, TextInput, View} from "react-native";
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import HTML from "react-native-render-html";
import {Colors} from "../../../constants/Colors.ts";

type Props = {
    task: Task;
    index: number
}

const MemoizedRenderHtml = React.memo(HTML);


export const CheckMultipleChoiceComponent = ({task,index}: Props) => {

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text>Задача {index + 1}</Text>

            {task?.homeTaskFiles?.map((el) => {
                return (
                    <View key={`${el.id}${index}`}>{renderFile(el)}</View>
                )
            })}

            {/* Вопрос */}
            <MemoizedRenderHtml
                baseStyle={GlobalStyle.taskQuestion}
                source={{html: memoizedHtml}}
                contentWidth={300}
            />
            <View>
                <TextInput
                    style={GlobalStyle.taskInputTextArea}
                    placeholder="Ответьте развернуто"
                    placeholderTextColor={Colors.textGray}
                    editable={false}
                />
            </View>
        </View>
    );
};

