import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Colors} from "../constants/Colors.ts";
import {toggleControlWork} from "../redux/slises/controlWorkStartStopSlice.ts";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";
import TimerControl from "../components/TimerControl/TimerControl.tsx";
import Toast from "react-native-toast-message";
import {passWork} from "../redux/slises/passWorkSlice.ts";
import {ROUTES} from "../constants/Routes.ts";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {resetResultControlWork, sendControlWorkAnswer} from "../redux/slises/controlWorkSendAnswerSlice.ts";
import {renderCorrectAnswer} from "./HomeworkScreen.tsx";
import {NTestComponent} from "../components/TestComponents/NTestComponent.tsx";
import {NDetailAnswerComponent} from "../components/TestComponents/NDetailAnswerComponent.tsx";
import {SendAnswerPayload} from "../redux/slises/answerSlice.ts";
import {NPassWordsComponent} from "../components/TestComponents/NPassWordsComponent.tsx";
import {NOrderComponent} from "../components/TestComponents/NOrderComponent.tsx";
import {NExactAnswerComponent} from "../components/TestComponents/NExactAnswerComponent.tsx";
import {NFileAnswerComponent} from "../components/TestComponents/NFileAnswerComponent.tsx";
import {NMultipleChoiceComponent} from "../components/TestComponents/NMultipleChoiceComponent.tsx";
import {NMatchComponent} from "../components/TestComponents/NMatchComponent.tsx";
import {calculateTimeSpent, getUrl} from "../settings/utils.ts";
import {reportsOwnBacklog} from "../redux/slises/reportsSlice.ts";

export const ControlWorkScreen = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();

    const {data: controlWork, loading, error} = useAppSelector(state => state.controlWork);
    const {isRunning, data: runningData, error : errRunning} = useAppSelector(state => state.controlWorkStartStop);
    const {result} = useAppSelector((state) => state.sendControlWorkAnswer);
    const [url, setUrlState] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };

        fetchUrl();
    }, []);

    const isCompletedWork = controlWork?.status >= 5

    useEffect(() => {
        dispatch(resetResultControlWork());

        // Проверяем, запущена ли работа (status === 1), и автоматически продолжаем работу
        if (controlWork?.status === 1 && !isRunning) {
            dispatch(toggleControlWork({ isRunning: true, id: controlWork?.id }))
                .unwrap()
                .catch((error) => {

                    Toast.show({
                        type: "error",
                        text1: "Ошибка",
                        text2: error?.message,
                        position: 'bottom'
                    });
                });
        }
    }, [controlWork]);

    useEffect(() => {
        dispatch(resetResultControlWork())
    }, [controlWork]);


    const image = controlWork?.left_time ? require('../assets/stopWork.png') : require('../assets/startWork.png');

    const buttonText = controlWork?.left_time
        ? (isRunning ? 'Пауза' : 'Продолжить')
        : (isRunning ? 'Пауза' : 'Начать контрольную работу');

    const completedOnlineTasks = controlWork?.theme?.controlTasks.filter(task => {
        // Получаем ключи объекта result
        const resultKeys = Object.keys(result);
        // Проверяем, есть ли task.id среди ключей объекта result
        return resultKeys.includes(task.task.id.toString());
    });

    const isCompletedHomeWork = controlWork?.controlWorkResults?.length === controlWork?.theme?.controlTasks?.length
    const isCompletedHomeWorkOnline = (controlWork?.controlWorkResults?.length + completedOnlineTasks?.length) === controlWork?.theme?.controlTasks?.length

    // Отслеживание фокуса экрана
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                // Добавляем проверку на то, что работа запущена
                if (isRunning) {
                    dispatch(toggleControlWork({isRunning: true, id: controlWork?.id}))
                        .unwrap()
                        .catch((error) => {
                            Toast.show({
                                type: "error",
                                text1: "Ошибка",
                                text2: errRunning || "Не удалось продолжить контрольную работу",
                                position: 'bottom'
                            });
                        });
                }
            };
        }, [isRunning, controlWork?.left_time])
    );

    const handleStartPause = () => {
        const action = isRunning
            ? toggleControlWork({ isRunning: true, id: controlWork?.id })
            : toggleControlWork({ isRunning: false, id: controlWork?.id });

        dispatch(action)
            .unwrap()
            .catch((error) => {

                Toast.show({
                    type: "error",
                    text1: "Ошибка",
                    text2: error?.message,
                    position: "bottom",
                });
            });
    };


    if (loading) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <CoursesHeader title={'Контрольная работа'}/>
                <View>
                    <Text style={{
                        textAlign: 'center',
                        marginBottom: 10,
                        fontSize: 16,
                        color: Colors.colorAccentFirst
                    }}>Error: {error?.error}</Text>
                    <Text style={{textAlign: 'center', fontSize: 16}}>УПС.... Произошла ошибка загрузки работы.
                        Попробуйте еще раз или обратитесь к преподавателю.</Text>
                </View>
            </View>
        );
    }

    const submitControlWorkZeroTime = async () => {
        try {

            Toast.show({
                type: 'success',
                text1: 'Время вышло!',
                position: 'bottom',
                bottomOffset: 50,
            });
            // Запускаем действие для сдачи работы
            await dispatch(passWork({id: controlWork?.id, isControlWork: true})).unwrap();
            await dispatch(reportsOwnBacklog());
            // @ts-ignore
            navigation.navigate(ROUTES.HOME_WORK)

            // // Устанавливаем таймер, чтобы через 3 секунды изменить статус
            // setTimeout(() => {
            //
            // }, 3000); // Время в миллисекундах (3 секунды, которое соответствует длительности Toast)

        } catch (error) {
            // Обрабатываем ошибку
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: error?.error,
                position: 'bottom',
                bottomOffset: 50,
            });
        }
    }

    const handleSubmitControlWork = async () => {
        if (isCompletedHomeWork || isCompletedHomeWorkOnline) {
            try {
                // if (!controlWork?.id) {
                //     throw new Error('ID домашней работы не найден');
                // }

                // Запускаем действие для сдачи работы
                await dispatch(passWork({id: controlWork?.id, isControlWork: true})).unwrap();

                Toast.show({
                    type: 'success',
                    text1: 'Успешно',
                    text2: 'Вы успешно сдали работу',
                    position: 'bottom',
                    bottomOffset: 50,
                });
                await dispatch(reportsOwnBacklog());
                setTimeout(() => {
                    // @ts-ignore
                    navigation.navigate(ROUTES.HOME_WORK)
                }, 1000); // Ожидание 3 секунд


                // // Устанавливаем таймер, чтобы через 3 секунды изменить статус
                // setTimeout(() => {
                //
                // }, 3000); // Время в миллисекундах (3 секунды, которое соответствует длительности Toast)

            } catch (error) {

                // Обрабатываем ошибку
                Toast.show({
                    type: 'error',
                    text1: 'Ошибка',
                    text2: error.error,
                    position: 'bottom',
                    bottomOffset: 50,
                });
            }
        } else {
            Toast.show({
                type: 'info',
                text1: 'Упс... Еще остались задания...',
                text2: 'Ответь на все задания и сдай работу',
                position: 'bottom',
                bottomOffset: 50,
            });
        }


    };

    const submitControlHandler = async (answer?: string, taskId?: string, answerData?: SendAnswerPayload) => {
       // console.log(answerData)
        const data = {
            answer,
            children_id: controlWork?.children_id,
            answer_type: 'text',
            task_id: taskId,
            lesson_id: controlWork?.id,
        };

        try {
            await dispatch(sendControlWorkAnswer(answerData ? answerData : data)).unwrap();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: error?.error,
                position: 'bottom',
                bottomOffset: 50,
            });
            console.error('Ошибка при отправке ответа', error);
        }

    }


    const renderTaskHandler = (item, index: number) => {
        const correct_answer = controlWork?.controlWorkResults.find(el => el.task_id === item.task.id)

        const getResultText = (task) => {
            let newText = result[task.id]?.message || '';

            if ((task.task.type === 'detail-answer' || task.task.type === 'file-answer') && correct_answer?.decided_right === 0) {
                return 'Решение принято';
            }

            if ((result[task.task.id] && task.task.type === 'detail-answer') || (result[task.task.id] && task.task.type === 'file-answer')) {
                return 'Решение принято';
            }

            if (!newText && correct_answer) {
                switch (correct_answer.score) {
                    case 0:
                        if (correct_answer.decided_right === 1 && task.task.type !== 'detail-answer' && task.task.type !== 'file-answer') {
                            newText = 'Решено верно';
                        } else {
                            newText = 'Решено неверно';
                        }
                        break;
                    case 1:
                        newText = 'Решено верно';
                        break;
                    case 2:
                    case 4:
                        newText = 'Решение принято';
                        break;
                    default:
                        newText = 'Нет результата';
                }
            }

            return newText;
        };

        const getButtonText = () => {
            let buttonText = 'Ответить'

            if (result[item.task.id]) {
                buttonText = 'Ответ принят'
            }

            if (correct_answer?.task_id === item?.task.id) {
                buttonText = 'Ответ принят'
            }

            return buttonText;
        }

        // Показывать ли инпут
        const showInput = getButtonText() === 'Ответить'
        const correct_answerHtml = correct_answer?.correct_answer ? renderCorrectAnswer(correct_answer?.correct_answer) : renderCorrectAnswer(item?.task?.correct_answer);
        const showCorrectAnswer =
            getButtonText() === 'Ответ принят'
            && (getResultText(item) === 'Решено неверно' || getResultText(item) === 'Не верный ответ')

        // Определяем компонент для рендеринга в зависимости от task.type
        const renderComponentByTaskType = () => {
            switch (item.task.type) {
                case 'test':
                    return <NTestComponent
                        task={item.task}
                        index={index + 1}
                        handleSubmit={submitControlHandler}
                        buttonSendText={getButtonText()}
                        resultText={getResultText(item)}
                        correct_answer={correct_answer}
                        result={result}
                        showCorrectAnswer={showCorrectAnswer}
                        isCompletedWork={isCompletedWork}

                    />;
                case 'pass-words':
                    return <NPassWordsComponent
                        task={item.task}
                        index={index + 1}
                        handleSubmit={submitControlHandler}
                        buttonSendText={getButtonText()}
                        resultText={getResultText(item)}
                        result={result}
                        correct_answer={correct_answer}
                        isCompletedWork={isCompletedWork}
                    />;
                case 'match':
                    return <NMatchComponent
                        task={item.task}
                        index={index + 1}
                        handleSubmit={submitControlHandler}
                        buttonSendText={getButtonText()}
                        resultText={getResultText(item)}
                        result={result}
                        correct_answer={correct_answer}
                    />;
                case 'detail-answer':
                    return <NDetailAnswerComponent
                        task={item.task}
                        index={index + 1}
                        buttonSendText={getButtonText()}
                        resultText={getResultText(item)}
                        lessonId={controlWork?.id}
                        childrenId={controlWork?.children_id}
                        correct_answer={correct_answer}
                        handleSubmit={submitControlHandler}
                        result={result}
                        isCompletedWork={isCompletedWork}

                    />;
                case 'file-answer':
                    return <NFileAnswerComponent
                        task={item.task}
                        controlWorkId={controlWork?.id}
                        index={index + 1}
                        result={result}
                        resultText={getResultText(item)}
                        handleSubmit={submitControlHandler}
                        correct_answer={correct_answer}
                        buttonSendText={getButtonText()}
                        lessonId={controlWork?.id}
                        childrenId={controlWork?.children_id}
                        isCompletedWork={isCompletedWork}
                        url={url}
                    />;
                case 'order':
                    return <NOrderComponent
                        task={item.task}
                        index={index + 1}
                        handleSubmit={submitControlHandler}
                        buttonSendText={getButtonText()}
                        resultText={getResultText(item)}
                        correct_answer={correct_answer}
                        result={result}
                        showCorrectAnswer={showCorrectAnswer}
                        showInput={showInput}
                        correctAnswerHtml={correct_answerHtml}
                        showHintCondition={false}
                    />;
                case 'multiple-choice':
                    return <NMultipleChoiceComponent
                        task={item.task}
                        index={index + 1}
                        handleSubmit={submitControlHandler}
                        buttonSendText={getButtonText()}
                        showInput={showInput}
                        correctAnswerHtml={correct_answerHtml}
                        showHintCondition={false}
                        showCorrectAnswer={showCorrectAnswer}
                        resultText={getResultText(item,)}
                        correct_answer={correct_answer}
                        result={result}
                        isCompletedWork={isCompletedWork}

                    />;
                case 'exact-answer':
                    return <NExactAnswerComponent
                        task={item.task}
                        index={index + 1}
                        buttonSendText={getButtonText()}
                        handleSubmit={submitControlHandler}
                        showInput={showInput}
                        correct_answerHtml={correct_answerHtml}
                        showHintCondition={false}
                        showCorrectAnswer={showCorrectAnswer}
                        correctAnswerHtml={correct_answerHtml}
                        result={result}
                        correct_answer={correct_answer}
                        resultText={getResultText(item,)}
                        isCompletedWork={isCompletedWork}
                        url={url}
                    />;
                default:
                    return <View><Text>test</Text></View>;
            }
        };

        return (
            <>
                {renderComponentByTaskType()}
            </>
        )

    }

    return (

        <View style={styles.container}>
            <CoursesHeader title={'Контрольная работа'}/>
            <View style={{marginBottom: 10}}>
                <Text
                    style={{textAlign: 'center', fontSize: 16}}>{controlWork?.theme?.name}</Text>
            </View>
            {
                !isCompletedWork ? <TimerControl
                        handleSubmitControlWork={submitControlWorkZeroTime}
                        handleStartPause={handleStartPause}
                        buttonText={buttonText}
                        isRunning={isRunning}

                    />
                    : <View style={styles.resultBlock}>
                        <Text style={styles.resultText}>Затрачено времени:</Text>
                        {
                            controlWork?.left_time &&
                            <Text style={styles.resultText}>{calculateTimeSpent(controlWork?.left_time)}</Text>
                        }

                    </View>
            }

            <ScrollView style={{flex: 1, padding: 10, backgroundColor: Colors.colorWhite}}>
                {/* Нижняя часть с приветствием и изображением */}
                {(!isCompletedWork && !isRunning) && (
                    <View style={styles.bottomSection}>
                        <View style={styles.bottomSectionHeader}>
                            {controlWork?.left_time
                                ? <Text style={styles.greeting}>Я НА ПАУЗЕ...</Text>
                                : <Text style={styles.greeting}>УДАЧИ ТЕБЕ!{'\n'}ВСЁ ПОЛУЧИТСЯ!</Text>}
                            <Image
                                source={image}
                                style={styles.image}
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleStartPause}>
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(isRunning || isCompletedWork) && (
                    <>
                        <FlatList
                            data={controlWork?.theme?.controlTasks || []}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({item, index}) => renderTaskHandler(item, index)}
                            ListFooterComponent={!isCompletedWork ? <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleSubmitControlWork}
                                >
                                    <Text style={styles.buttonText}>Сдать работу</Text>
                                </TouchableOpacity>
                                : null
                            }
                        />
                    </>
                )}
            </ScrollView>
            <Toast config={toastConfig}/>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
    },
    resultBlock: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between'

    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        gap: 10
    },
    button: {
        backgroundColor: '#FFC107', // Желтый цвет

        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,

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
    resultText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.colorBlack,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.colorBlack,
        textAlign: 'center'
    },
    timer: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomSection: {
        backgroundColor: '#6A1B9A', // Фиолетовый цвет
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginHorizontal: 10
    },
    bottomSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
    },
    image: {
        width: 120,
        height: 150,
    },
    taskItem: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
    },
});
