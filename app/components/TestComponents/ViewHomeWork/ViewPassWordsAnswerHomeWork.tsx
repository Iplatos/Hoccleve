import React from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import HTML from "react-native-render-html";
import {useAppSelector} from "../../../redux/hooks.ts";
import {Colors} from "../../../constants/Colors.ts";

import {convertJsonToHtml} from "../../../settings/helpers.tsx";

import {handleOpenFile, safeParse} from "../../../settings/utils.ts";
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {extractText} from "../NPassWordsComponent.tsx";
import Constructor from "../../FormulaConstructor/Constructor.tsx";
import {CorrectConstructorAnswer} from "../../FormulaConstructor/components/CorrectConstructorAnswer.tsx";
import {TimeSpentBlock} from "../../TimeSpentBlock/TimeSpentBlock.tsx";

export type AnswerOption = {
    question: string;
    index: number;
    answer: number;
    type: string;
};

export type CorrectAnswer = {
    text: string;
    index: number;
    is_correct: boolean
};

type Props = {
    task: any;
    index: number
    resultText?: string
    buttonSendText?: string
};

export const ViewPassWordsAnswerHomeWork = ({task, index, buttonSendText, resultText}: Props) => {
    console.log('ViewPassWordsAnswerHomeWork', index, task)

    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.id)
    const answerOptions: AnswerOption[] = JSON.parse(task.answer_options);
    const userAnswerList = correct_answer?.answer ? JSON.parse(correct_answer.answer) : [];

    const formulaValuesByIndex: CorrectAnswer[] = correct_answer && JSON.parse(correct_answer?.answer)

  //  console.log('formulaValuesByIndex', formulaValuesByIndex[0])
    const correctAnswer = safeParse(task?.correct_answer!);


    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray, marginBottom: 10}}>Задача {index}</Text>
            <View style={styles.section}>


            </View>
            <HTML
                baseStyle={{paddingBottom: 0, fontSize: 16, marginBottom: 10}}
                source={{html: convertJsonToHtml(task.question)}}
                contentWidth={300}
            />


            {answerOptions.map((option, idx) => {
                const isDisabledConstructor = option.type === 'constructor' && true

                return (
                    <View key={`${option.answer}-${idx}`}>
                        <Text style={styles.questionPart}>{extractText(option.question)}</Text>
                        {
                            option.type === 'constructor' ?
                                <View style={!formulaValuesByIndex[idx].is_correct && {
                                    borderWidth: 1,
                                    borderColor: 'red',
                                    borderRadius: 8
                                }}>
                                    <Constructor
                                        value={Array.isArray(formulaValuesByIndex[idx].text) ? formulaValuesByIndex[idx].text : []}
                                        prohibitEditing={isDisabledConstructor}
                                        validate={false}
                                        name="formula"
                                    />
                                </View>
                                : <View>
                                    <View style={!formulaValuesByIndex[idx].is_correct && {
                                        borderWidth: 1,
                                        borderColor: 'red',
                                        borderRadius: 8
                                    }}>
                                        <TextInput
                                            style={GlobalStyle.taskInput}
                                            placeholderTextColor={Colors.textGray}
                                            placeholder="Напишите ответ"
                                            //   onChangeText={(text) => updateAnswer(idx, text)}
                                            value={userAnswerList[idx]?.text || ''}
                                            // editable={!isCompletedWork} // Блокируем ввод, если работа завершена
                                        />

                                    </View>
                                </View>
                        }
                    </View>
                )
            })}


            <CorrectConstructorAnswer
                showCorrectAnswers={true}
                correctAnswer={correctAnswer}
                isConstructor={true}
            />

            <TimeSpentBlock
             isTimedTask={task.is_timed_task}
             timeSpent={correct_answer?.time_spent!}
            />

            {/*<View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>*/}
            {/*    <View style={{flex: 1}}>*/}
            {/*        <Text style={[styles.answerBlock, {*/}
            {/*            backgroundColor: Colors.colorAccentRGB*/}
            {/*        }]}>Правильные ответы*/}
            {/*        </Text>*/}
            {/*        /!*{*!/*/}
            {/*        /!*    correctAnswerOptions?.map(option => (*!/*/}
            {/*        /!*        <Text style={[{*!/*/}
            {/*        /!*            fontSize: 16,*!/*/}
            {/*        /!*            backgroundColor: Colors.white,*!/*/}
            {/*        /!*            color: Colors.colorBlack,*!/*/}
            {/*        /!*            textAlign: 'center',*!/*/}
            {/*        /!*            padding: 5*!/*/}
            {/*        /!*        }]}>*!/*/}
            {/*        /!*            {option.text}*!/*/}
            {/*        /!*        </Text>*!/*/}
            {/*        /!*    ))*!/*/}
            {/*        /!*}*!/*/}
            {/*    </View>*/}

            {/*</View>*/}


            {
                correct_answer?.comment_files &&
                JSON.parse(correct_answer?.comment_files).map((file, index) => {
                  //  console.log(file)
                    return (
                        <TouchableOpacity key={`${file.path}${index}`} onPress={() => handleOpenFile(file.path)} style={GlobalStyle.btnOpenFile}>
                            <Text style={{fontSize: 16, textAlign: 'center'}}>Вложение № {index + 1}</Text>
                        </TouchableOpacity>
                    )
                })
            }



            {
                correct_answer?.comment &&
                <View style={{marginTop: 10}}>
                    <Text style={{color: Colors.colorGray, marginBottom: 10}}>Комментарий учителя</Text>
                    <Text>{correct_answer?.comment}</Text>
                </View>
            }
        </View>

    );
};

const styles = StyleSheet.create({
    container: {},
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    section: {
        marginBottom: 10,
    },
    questionText: {
        marginVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    questionPart: {
        flex: 1,
        fontSize: 14,
    },
    answerRow: {
        fontSize: 16,
        //  flexDirection: 'row',
        //  alignItems: 'center',
        // marginBottom: 5,

    },
    answerBlock: {
        //  width: '50%',
        backgroundColor: Colors.colorAccentFirst,
        borderRadius: 10,
        padding: 8,
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
        // marginBottom: 7,
        fontSize: 16
    },
    btnOpenFile: {
        backgroundColor: Colors.colorWhite,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        //  marginBottom: 15,
        marginTop: 10
    },
    input: {
        height: 80,
        fontSize: 16,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: 'white',
        marginBottom: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
    answerSend: {
        width: '50%',
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 8,
        color: Colors.colorBlack,
        alignItems: 'center',
        fontWeight: 'bold',
        marginBottom: 10,
        justifyContent: "center"
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
