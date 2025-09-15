import React, {useMemo, useState} from 'react';
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {Text, TextInput, View} from "react-native";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import HTML from "react-native-render-html";
import {FileUploaderComponent} from "../../FileUploaderComponent/FileUploaderComponent.tsx";
import {Colors} from "../../../constants/Colors.ts";

type Props = {
    task: Task;
    index: number
}

const MemoizedRenderHtml = React.memo(HTML);

export const CheckDetailAnswerComponent = ({task, index}: Props) => {
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); // Теперь выбранные файлы хранятся здесь

    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text>Задача {index + 1}</Text>
            {/* Отображение картинки или аудио */}

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

            {/* Компонент загрузки файлов */}
            <FileUploaderComponent
                disabled={true}
                onFilesSelected={setSelectedFiles}
            />

        </View>
    );
};

