import React from 'react';
import {View, Text, TextInput} from 'react-native';
import {FormulaItem} from "../constans.ts";
import {Colors} from "../../../constants/Colors.ts";
import Constructor from "../Constructor.tsx";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";


interface CorrectConstructorAnswerProps {
    showCorrectAnswers: boolean;
    isConstructor: boolean;
    correctAnswer: { type: string; text?: FormulaItem[] | string }[];
}

export const CorrectConstructorAnswer: React.FC<CorrectConstructorAnswerProps> = (
    {
        showCorrectAnswers,
        isConstructor,
        correctAnswer
    }) => {
    if (!showCorrectAnswers || !isConstructor) return null;

    return (
        <>
            <View
                style={{
                    backgroundColor: Colors.colorAccentRGB,
                    padding: 10,
                    borderRadius: 8,
                    marginVertical: 10
                }}
            >
                <Text style={{color: Colors.colorWhite, fontSize: 16}}>
                    Правильные ответы
                </Text>
            </View>

            {Array.isArray(correctAnswer) &&
                correctAnswer.map((el, i) => {
                    if (el.type === 'constructor') {
                        return (
                            <View key={i} style={{marginBottom: 10, flexDirection: 'row', gap: 5}}>
                                <Text>{i+1})</Text>
                                <Constructor
                                    value={Array.isArray(el.text) ? el.text : []}
                                    prohibitEditing={true}
                                    validate={false}
                                />
                            </View>
                        )
                    } else {
                        return (
                            <View key={i} style={{marginBottom: 10, flexDirection: 'row', gap: 5}}>
                                <Text>{i+1})</Text>
                                <TextInput
                                    style={GlobalStyle.taskInput}
                                    placeholder="Напишите ответ"
                                    placeholderTextColor={Colors.textGray}
                                    value={el?.text}
                                    disabled={true}
                                />
                            </View>

                        )
                    }
                })}
        </>
    );
};


