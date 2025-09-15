import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {SurveyQuestion} from '../../../redux/slises/surveySlice.ts';
import {GlobalStyle} from '../../../constants/GlobalStyle.ts';
import {Colors} from '../../../constants/Colors.ts';

interface DetailedAnswerQuestionProps {
    question: SurveyQuestion;
    index: number;
    value?: string | string[];
    onChange: (text: string) => void;
}

export const DetailedAnswerQuestion: React.FC<DetailedAnswerQuestionProps> = (
    {
        question,
        index,
        value = '',
        onChange,
    }) => {



    const getQuestionText = () => {

        try {
            return question.questionText.content[0].content[0].text;
        } catch (e) {
            console.warn('Could not parse question text', e);
            return 'Вопрос';
        }
    };

    return (
        <View style={GlobalStyle.surveyQuestionContainer}>
            <Text style={GlobalStyle.surveyQuestionNumber}>{`Вопрос №${index + 1}`}</Text>
            <Text style={GlobalStyle.surveyQuestionText}>{getQuestionText()}</Text>

            <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={5}
                placeholder="Введите ваш ответ..."
                value={value}
                onChangeText={onChange}
                textAlignVertical="top"
                placeholderTextColor={Colors.textGray}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    textArea: {
        borderWidth: 1,
        borderColor: Colors.backgroundPurple,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        marginTop: 10,
        minHeight: 120,
        color: '#000',
    },
});
