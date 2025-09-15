import React, {useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useAppSelector} from "../../redux/hooks.ts";
import {Colors} from "../../constants/Colors.ts";
import HTML from "react-native-render-html";
import {convertJsonToHtml} from "../../settings/helpers.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import Constructor from "../FormulaConstructor/Constructor.tsx";
import {FormulaItem} from "../FormulaConstructor/constans.ts";

type SendAnswerComponentProps = {
    showInput: boolean,
    userAnswer?: {
        type: "constructor",
        value: FormulaItem[]
    },
    hint: string,
    handleSubmit: (answer: string) => void,
    showHintCondition?: boolean,
    loading?: boolean,
    buttonTitle: string,
    taskId: number
    correctAnswerHtml: string
    showCorrectAnswer: boolean
    isConstructor?: boolean
    isDisabledConstructor?: boolean
}
const MemoizedRenderHtml = React.memo(HTML);

export const SendAnswerComponent = (
    {
        showInput,
        hint,
        handleSubmit,
        showHintCondition,
        buttonTitle,
        loading,
        taskId,
        userAnswer,
        showCorrectAnswer,
        correctAnswerHtml,
        isDisabledConstructor,
        isConstructor
    }: SendAnswerComponentProps) => {
    const [answer, setAnswer] = useState('');
    const [showHint, setShowHint] = useState(false);
    const {result} = useAppSelector((state) => state.answerPost);
    const memoizedHtml = useMemo(() => convertJsonToHtml(result[taskId]?.prompt || hint), [result]);
    const [formulaValue, setFormulaValue] = useState<FormulaItem[]>(userAnswer?.value ?? []);
    const [errors, setErrors] = useState({items: {}, valid: true});

    //console.log('correctAnswerHtml', correctAnswerHtml)

    const handleShowHint = () => {
        setShowHint(!showHint);
    };

    const submitHandler = () => {
        const constructorData = {
            type: "constructor",
            value: formulaValue,
        }
        handleSubmit(JSON.stringify(constructorData))
    }

    return (
        <>
            {
                isConstructor ?
                    <>
                        <Constructor
                            value={formulaValue}
                            edit={setFormulaValue}
                            prohibitEditing={isDisabledConstructor} // true — только для чтения
                            validate={false}
                            onError={setErrors}
                            name="formula"
                        />
                        <TouchableOpacity
                            onPress={submitHandler}
                            disabled={buttonTitle === 'Ответ принят'}
                            style={[GlobalStyle.taskAnswerBtn, {backgroundColor: buttonTitle === 'Ответ принят' ? Colors.colorAccentFirst : Colors.white}]}>
                            {loading ? <ActivityIndicator/> : <Text
                                style={{
                                    color: buttonTitle === 'Ответ принят' ? Colors.white : Colors.colorBlack
                                }}
                            >{buttonTitle}</Text>}
                        </TouchableOpacity>
                    </> : <View>
                        {showInput && (
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors.textGray}
                                placeholder="Напишите ответ"
                                value={answer}
                                onChangeText={setAnswer}
                            />
                        )}
                        <View style={{flexDirection: 'row', gap: 10, paddingRight: 10}}>
                            <TouchableOpacity
                                onPress={() => handleSubmit(answer)}
                                disabled={buttonTitle === 'Ответ принят'}
                                style={[GlobalStyle.taskAnswerBtn, {backgroundColor: buttonTitle === 'Ответ принят' ? Colors.colorAccentFirst : Colors.white}]}>
                                {loading ? <ActivityIndicator/> : <Text
                                    style={{
                                        color: buttonTitle === 'Ответ принят' ? Colors.white : Colors.colorBlack
                                    }}
                                >{buttonTitle}</Text>}
                            </TouchableOpacity>

                            {showHintCondition && (
                                <TouchableOpacity onPress={handleShowHint} style={styles.hintButton}>
                                    <Text style={styles.hintButtonText}>
                                        {showHint ? 'Скрыть подсказку' : 'Получить подсказку'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {showHint && (
                            <View style={styles.Hintsection}>
                                <MemoizedRenderHtml
                                    source={{html: memoizedHtml}}
                                    enableExperimentalBRCollapsing={true}
                                    contentWidth={400}/>
                            </View>
                        )}
                        {
                            (showCorrectAnswer && correctAnswerHtml) &&
                            <View style={{flex: 1}}>
                                <Text style={[styles.answerBlock, {
                                    backgroundColor: Colors.colorAccentRGB
                                }]}>Правильный ответ</Text>
                                <Text style={[styles.answerBlock, {
                                    backgroundColor: Colors.white,
                                    color: Colors.colorBlack
                                }]}>{correctAnswerHtml}</Text>
                            </View>
                        }
                    </View>
            }
        </>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        marginBottom: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    answerBlock: {
        //  width: '50%',
        backgroundColor: Colors.colorAccentFirst,
        borderRadius: 10,
        padding: 8,
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 7,
        fontSize: 16
    },
    Hintsection: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 10
    },
    hintButton: {
        backgroundColor: '#fdc243',
        padding: 8,
        width: '50%',
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    hintButtonText: {
        color: Colors.colorBlack,
        fontWeight: 'bold',
    },
    hintContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginVertical: 10,
    },
    attemptMessage: {
        marginTop: 10,
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
})
