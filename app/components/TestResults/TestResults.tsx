import React from 'react';
import {StyleSheet, Text, View} from "react-native";
import {Colors} from "../../constants/Colors.ts";
import {renderCorrectAnswerText} from "../TestComponents/ViewHomeWork/ViewOrderAndDetailAnswerHomeWork.tsx";
import {HomeWorkResults} from "../../redux/slises/homeWorkDetailSlice.ts";

type Props = {
    correct_answer: HomeWorkResults;
    taskType: string
}

export const TestResults = ({correct_answer, taskType}: Props) => {
    return (
        <>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                <View style={{flex: 1}}>
                    <Text style={styles.answerBlock}>Ваш ответ</Text>
                    <Text style={[styles.answerBlock, {
                        backgroundColor: Colors.white,
                        color: Colors.colorBlack,
                        flex: 1,
                        justifyContent: 'center'
                    }]}>{
                        correct_answer?.answer
                            ? correct_answer?.answer
                            : "нет ответа"
                    }</Text>
                </View>
                {
                    correct_answer?.correct_answer &&
                    <View style={{flex: 1}}>
                        <Text style={[styles.answerBlock, {
                            backgroundColor: Colors.colorAccentRGB
                        }]}>Правильный ответ
                        </Text>

                        {taskType === 'exact-answer'
                            ? <Text style={[styles.answerBlock, {
                                backgroundColor: Colors.white,
                                color: Colors.colorBlack,
                                flex: 1,
                                justifyContent: 'center'
                            }]}>{renderCorrectAnswerText(correct_answer?.correct_answer)}</Text>
                            : <Text style={[styles.answerBlock, {
                                backgroundColor: Colors.white,
                                color: Colors.colorBlack,
                                flex: 1,
                                justifyContent: 'center'
                            }]}>{correct_answer?.correct_answer}</Text>
                        }
                    </View>
                }

            </View>

        </>
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
        fontSize: 16
    },
})
