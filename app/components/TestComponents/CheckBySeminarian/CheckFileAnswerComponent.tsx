import React, {useState} from 'react';
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import {Colors} from "../../../constants/Colors.ts";
import {safeParse} from "../../../settings/utils.ts";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {renderFile} from "../../../settings/helpers.tsx";
import MathJaxSvg from "react-native-mathjax-svg";
import {FileUploaderComponent} from "../../FileUploaderComponent/FileUploaderComponent.tsx";

type CheckFileAnswerComponentProps = {
    task: Task;
    index: number
}

export const CheckFileAnswerComponent = ({task, index}: CheckFileAnswerComponentProps) => {
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); // Теперь выбранные файлы хранятся здесь

    const parsedQuestion = safeParse(task.question);

    const questionText1 = parsedQuestion?.content?.[0]?.content?.[0]?.text || '';
    const formula2 = parsedQuestion?.content?.find((form: any) => form.type === 'math')?.attrs?.value || ''
    const questionText2 = parsedQuestion?.content?.[2]?.content?.[0]?.text || '';

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray}}>Задача {index + 1}</Text>

            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles?.map((el: FileData) => {
                return (
                    <View key={el.id}>
                        {renderFile(el)}
                    </View>
                )
            })}
            <ScrollView
                horizontal={!!formula2}
                style={{paddingVertical: 15}}>
                {/* Отображение первой части вопроса */}
                <Text style={styles.questionText}> {renderProseMirrorText(parsedQuestion)}</Text>

                {/* Отображение формулы с MathJaxSvg */}
                <MathJaxSvg fontSize={16}>
                    {`${formula2}`}
                </MathJaxSvg>

                {/* Отображение второй части вопроса */}
                {/*<Text style={styles.questionText}>{questionText2}</Text>*/}

            </ScrollView>
            <FileUploaderComponent
                disabled={true}
                onFilesSelected={setSelectedFiles} // передаем колбэк для получения файлов
            />
        </View>
    );
};

export const renderProseMirrorText = (node: any): React.ReactNode => {
    if (!node) return null;

    if (Array.isArray(node)) {
        return node.map((child, index) => (
            <React.Fragment key={index}>
                {renderProseMirrorText(child)}
            </React.Fragment>
        ));
    }

    switch (node.type) {
        case 'doc':
        case 'paragraph':
        case 'listItem':
        case 'orderedList':
        case 'bulletList':
            return (
                <View style={{}}>
                    {renderProseMirrorText(node.content)}
                </View>
            );

        case 'text':
            return <Text>{node.text}</Text>;

        default:
            return renderProseMirrorText(node.content); // fallback
    }
};

const styles = StyleSheet.create({
    questionText: {
        fontSize: 16,
        //  marginBottom: 8,
        color: '#333',
    },
});
