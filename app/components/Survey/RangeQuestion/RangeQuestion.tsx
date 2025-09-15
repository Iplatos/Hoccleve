import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';
import {SurveyQuestion} from "../../../redux/slises/surveySlice.ts";
import {Colors} from "../../../constants/Colors.ts";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";


interface RangeQuestionProps {
    question: SurveyQuestion;
    index: number;
    value?: number;
    onChange: (value: number) => void;
}

export const RangeQuestion: React.FC<RangeQuestionProps> = ({ question, index, value, onChange }) => {
    const getQuestionText = () => {
        try {
            return question.questionText.content[0].content[0].text;
        } catch (e) {
            console.warn('Could not parse question text', e);
            return 'Вопрос';
        }
    };

    const min = parseFloat(question.min.toString());
    const max = parseFloat(question.max.toString());
    const step = parseFloat((question.step ?? '1').toString());
    const initial = value ?? (question.answers
        ? parseFloat(question.answers.toString())
        : min);

    // локальное значение ползунка
    const [sliderValue, setSliderValue] = useState(initial);

    // синхронизация при изменении извне (например, сброс формы)
    useEffect(() => {
        setSliderValue(initial);
    }, [value]);

    const questionText = getQuestionText();

    return (
        <View style={GlobalStyle.surveyQuestionContainer}>
            <Text style={GlobalStyle.surveyQuestionNumber}>{`Вопрос №${index + 1}`}</Text>
            <Text style={GlobalStyle.surveyQuestionText}>{questionText}</Text>

            <View style={styles.sliderContainer}>
                <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>{sliderValue}</Text>
                    {question.answerOptions[0]?.unit && (
                        <Text style={styles.unitText}>{question.answerOptions[0].unit}</Text>
                    )}
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={sliderValue}
                  //  onValueChange={setSliderValue} // обновляем только локально
                   onSlidingComplete={onChange} // отправляем наружу только по завершении
                    minimumTrackTintColor={Colors.backgroundPurple}
                    maximumTrackTintColor="#d3d3d3"
                    thumbTintColor={Colors.backgroundPurple}
                />
            </View>

            <View style={styles.labelsContainer}>
                <Text style={styles.label}>{min}</Text>
                <Text style={styles.label}>{max}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({

    questionText: {
        fontSize: 16,
        marginBottom: 10,
    },
    sliderContainer: {
        marginVertical: 15,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    valueContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    valueText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    unitText: {
        fontSize: 16,
        marginLeft: 5,
        color: '#666',
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
});
