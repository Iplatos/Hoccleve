import React, {useState} from 'react';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { RadioButtonGroup, RadioButtonItem } from 'expo-radio-button';
// @ts-ignore
import { Checkbox } from 'react-native-paper';
import {AnswerOption, SurveyQuestion} from "../../../redux/slises/surveySlice.ts";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {Colors} from "../../../constants/Colors.ts";
import {RNCheckbox} from "../../RNCheckbox/RNCheckbox.tsx";


interface TestQuestionProps {
    question: SurveyQuestion;
    index: number;
    value?: string | string[];
    onChange: (value: string | string[]) => void;
}

export const TestQuestion: React.FC<TestQuestionProps> = ({ question, index, value, onChange }) => {

    const selectedAnswers = Array.isArray(value) ? value : value ? [value] : [];

    const getQuestionText = () => {
        try {
            return question.questionText.content[0].content[0].text;
        } catch (e) {
            console.warn('Could not parse question text', e);
            return 'Вопрос';
        }
    };

    const getOptionText = (option: AnswerOption) => {
        try {
            return option.option.content[0].content[0].text;
        } catch (e) {
            console.warn('Could not parse option text', e);
            return 'Вариант';
        }
    };

    const toggleAnswer = (answerId: string) => {
        if (question.multiple) {
            const updated = selectedAnswers.includes(answerId)
                ? selectedAnswers.filter(id => id !== answerId)
                : [...selectedAnswers, answerId];
            onChange(updated);
        } else {
            onChange(answerId);
        }
    };

    return (
        <View style={GlobalStyle.surveyQuestionContainer}>
            <Text style={GlobalStyle.surveyQuestionNumber}>{`Вопрос №${index + 1}`}</Text>
            <Text style={GlobalStyle.surveyQuestionText}>{getQuestionText()}</Text>

            {question.multiple ? (
                question.answerOptions.map(option => (
                    <View
                        key={option.id}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                    >
                        <RNCheckbox
                            isChecked={selectedAnswers.includes(option.id)}
                            onPress={() => toggleAnswer(option.id)}
                            checkboxStyle={{
                                borderWidth: 1,
                                borderColor: Colors.backgroundPurple,
                                width: 20,
                                height: 20,
                            }}
                            text={getOptionText(option)}
                            textStyle={{ marginLeft: 8 }}
                        />
                    </View>
                ))
            ) : (
                <RadioButtonGroup
                    selected={selectedAnswers[0] || null}
                    onSelected={toggleAnswer}
                    radioStyle={{
                      //  width: 20,
                      //  height: 20,
                        borderRadius: 0, // делаем круг
                       // borderWidth: 2,
                       // borderColor: Colors.borderGray,
                    }}
                    radioBackground={Colors.backgroundPurple}
                    containerOptionStyle={{ marginBottom: 5,  }}

                >
                    {question.answerOptions.map(option => (
                        <RadioButtonItem key={option.id} value={option.id} label={getOptionText(option)} />
                    ))}
                </RadioButtonGroup>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    asdf: {

    }
});

