import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from "react-native";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import HTML from "react-native-render-html";
import {convertJsonToHtml} from "../../../settings/helpers.tsx";
import {renderQuestionContent, UserAnswerSend} from "../NPassWordsComponent.tsx";
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import MathJaxSvg from "react-native-mathjax-svg";
import Constructor from "../../FormulaConstructor/Constructor.tsx";
import {FormulaItem} from "../../FormulaConstructor/constans.ts";
import {useAppSelector} from "../../../redux/hooks.ts";
import {jsonConvert} from "../../../settings/utils.ts";
import {Colors} from "../../../constants/Colors.ts";

type CheckPassWordsComponentProps = {
    task: Task;
    index: number
}
const MemoizedRenderHtml = React.memo(HTML);

export const CheckPassWordsComponent = ({task, index}: CheckPassWordsComponentProps) => {
    const [userAnswers, setUserAnswers] = useState<UserAnswerSend[]>([]);
    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);
    const memoizedComponents = useMemo(() => convertJsonToReactComponents(task.question), [task.question]);
    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const userAnswerJson = homeWork?.homeWorkResults.find(element => element.task_id === task.id)?.answer;
    const userAnswer = jsonConvert(userAnswerJson, 'string')
    const [formulaValuesByIndex, setFormulaValuesByIndex] = useState<FormulaItem[][]>(
        Array.isArray(userAnswer)
            ? userAnswer.map((ans: any) => (Array.isArray(ans?.text) ? ans.text : []))
            : []
    );
    const answerOptions = useMemo(() => {
        if (Array.isArray(task.answer_options)) {
            return task.answer_options;
        } else {
            return []; // если пришла строка, чтобы не упасть на .map()
        }
    }, [task.answer_options]);

    const updateAnswer = (idx: number, text: string) => {
        const updatedAnswers = [...userAnswers];
        if (updatedAnswers[idx]) {
            updatedAnswers[idx].text = text;
        } else {
            updatedAnswers[idx] = {text};
        }
        setUserAnswers(updatedAnswers);
    };

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text>Задача {index + 1}</Text>
            <MemoizedRenderHtml
                baseStyle={GlobalStyle.taskQuestion}
                source={{html: memoizedHtml}}
                contentWidth={300}
            />

            {memoizedComponents}

            {answerOptions.map((option, idx) => {
                const isDisabledConstructor = option.type === 'constructor'
                return (
                    <View key={`${option.answer}-${idx}`} style={styles.answerRow}>
                        <View style={styles.questionPart}>{renderQuestionContent(option.question)}</View>
                        {
                            option.type === 'constructor' ?
                                <Constructor
                                    value={Array.isArray(formulaValuesByIndex[idx]) ? formulaValuesByIndex[idx] : []}
                                    prohibitEditing={isDisabledConstructor}
                                    validate={false}
                                    name="formula"
                                /> :
                                <TextInput
                                    style={GlobalStyle.taskInput}
                                    placeholder="Напишите ответ"
                                    placeholderTextColor={Colors.textGray}
                                    editable={false}
                                    onChangeText={(text) => updateAnswer(idx, text)}
                                />
                        }
                    </View>
                )
            })}
        </View>
    );
};

export const convertJsonToReactComponents = (json: string) => {
    try {
        const parsedJson = JSON.parse(json);

        if (!parsedJson.content || !Array.isArray(parsedJson.content)) {
            return <Text>Нет подсказки</Text>;
        }

        return parsedJson.content.map((block: any, index: number) => {

            //      ПРОВЕРИТЬ БЛОК - когда в вопросе и текст и формула

            // if (block.type === 'paragraph' && Array.isArray(block.content)) {
            //     const paragraphContent = block.content.map((item: any, i: number) => {
            //         if (item.type === 'text') {
            //             return (
            //                 <Text key={i} style={{ fontSize: 16 }}>
            //                     {item.text}
            //                 </Text>
            //             );
            //         }
            //         return null;
            //     });
            //
            //     return (
            //         <View key={index} style={{ marginBottom: 6 }}>
            //             {paragraphContent}
            //         </View>
            //     );
            // }

            if (block.type === 'math' && block.attrs?.value) {
                const formulas = block.attrs.value.split('\n').filter(Boolean);

                return (
                    <View key={index} style={{marginBottom: 8}}>
                        {formulas.map((formula: any, idx: any) => (
                            <MathJaxSvg
                                key={idx}
                                fontSize={16}
                                style={{paddingVertical: 4, marginBottom: 10}}
                            >
                                {formula}
                            </MathJaxSvg>
                        ))}
                    </View>
                );
            }

            return null;
        });
    } catch (error) {
        return <Text>Ошибка разбора вопроса</Text>;
    }
};

const extractTextFromJson = (node: any): string => {
    if (!node || typeof node !== 'object') return '';

    if (node.type === 'text') {
        return node.text || '';
    }

    if (Array.isArray(node.content)) {
        return node.content.map(extractTextFromJson).join('');
    }

    return '';
};

const styles = StyleSheet.create({
    answerRow: {
        flexDirection: 'column',
        //  alignItems: 'center',
        gap: 5,
        marginBottom: 5,
    },
    questionPart: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 14,
    },
});

