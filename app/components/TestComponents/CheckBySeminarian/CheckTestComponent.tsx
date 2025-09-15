import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import {Colors} from "../../../constants/Colors.ts";
import {renderFile} from "../../../settings/helpers.tsx";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import MathJaxSvg from "react-native-mathjax-svg";
import {safeParse} from "../../../settings/utils.ts";

type CheckTestComponentProps = {
    task: Task;
    index: number
}

type ParagraphContent = {
    type: 'paragraph' | 'math';
    content?: { text: string }[];
    attrs?: { value: string };
};

export const CheckTestComponent = ({task, index}: CheckTestComponentProps) => {
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const parsedQuestion = safeParse(task.question);
    const answerOptions = task.answer_options;

    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray}}>Задача {index + 1}</Text>

            {task?.homeTaskFiles?.map(el => renderFile(el))}

            {parsedQuestion?.content?.map((item: ParagraphContent, i: number) => {
                if (item.type === 'paragraph') {
                    return (
                        <Text key={i} style={GlobalStyle.taskQuestion}>
                            {item.content?.map(subItem => subItem.text).join('')}
                        </Text>
                    );
                } else if (item.type === 'math') {
                    return (
                        <MathJaxSvg key={i} fontSize={16} style={styles.mathFormula}>
                            {`${item.attrs?.value}`}
                        </MathJaxSvg>
                    );
                }
                return null;
            })}

            {/* Отображение вариантов ответов */}
            {Array.isArray(answerOptions) && answerOptions.map(option => (
                <TouchableOpacity
                    key={option.index}
                    //  onPress={() => handleSelectOption(option.index)}
                    style={[styles.optionContainer,
                        // { opacity: buttonSendText === 'Ответ принят' ? 0.5 : 1 }
                    ]}
                    disabled={true}
                >
                    <View style={styles.checkbox}>
                        {selectedOptions.includes(option.index) && (
                            <View style={styles.checkboxSelected}/>
                        )}
                    </View>

                    {/* Отображение текста и формул для каждого варианта */}
                    {typeof option.text === 'string' ? (
                        <Text style={styles.optionText}>{option.text}</Text>
                    ) : (
                        option.text.content.map((item, i) => {
                            if (item.type === 'math') {
                                return (
                                    <MathJaxSvg key={i} fontSize={16}>
                                        {`$${item.attrs.value}$`}
                                    </MathJaxSvg>
                                );
                            } else {
                                return (
                                    <Text key={i} style={styles.optionText}>
                                        {item.content?.map(subItem => subItem.text).join('')}
                                    </Text>
                                );
                            }
                        })
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    answerBlock: {
        backgroundColor: Colors.colorAccentFirst,
        borderRadius: 10,
        padding: 8,
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 7,
        fontSize: 16
    },
    mathFormula: {
        marginBottom: 15,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkbox: {
        height: 20,
        width: 20,
        //  borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.colorAccent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    checkboxSelected: {
        height: 20,
        width: 20,
        // borderRadius: 10,
        backgroundColor: Colors.colorAccent,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
    },
});