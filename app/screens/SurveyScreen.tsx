import React, {useState} from 'react';
import {ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {RangeQuestion} from "../components/Survey/RangeQuestion/RangeQuestion.tsx";
import {TestQuestion} from "../components/Survey/TestQuestion/TestQuestion.tsx";
import {
    fetchMySurveyAbout,
    markSurveyCompleted,
    sendSurveyAnswers,
    SurveyCondition,
    SurveyQuestion
} from "../redux/slises/surveySlice.ts";
import {DetailedAnswerQuestion} from "../components/Survey/DetailedAnswerQuestion/DetailedAnswerQuestion.tsx";
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";
import {Colors} from "../constants/Colors.ts";
import {useAuth} from "../context/AuthContext.tsx";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {GlobalStyle} from "../constants/GlobalStyle.ts";
import {fetchThemeLessons} from "../redux/slises/themeLessonsSlice.ts";
import {fetchControlWork} from "../redux/slises/controlWorkSlice.ts";
import {ROUTES} from "../constants/Routes.ts";
import {fetchLessonData} from "../redux/slises/lessonSlice.ts";
import {useNavigation, useRoute} from "@react-navigation/native";
import {hasRole} from "../settings/helpers.tsx";


export const SurveyScreen = () => {
    const route = useRoute();
    const navigation = useNavigation()
    // @ts-ignore
    const surveyId = route.params?.surveyId as number | undefined;
    const dispatch = useAppDispatch();
    const {groupID, type, blockID, themeID, course_id} = useAppSelector(state => state.studentCourses);
    const lesson = useAppSelector(state => state.lesson);

    const {data, loading, reportLoading, error} = useAppSelector(state => state.survey);
    const {authState} = useAuth()
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);
    const visibleQuestions = data?.questions.reduce((acc: any[], question) => {
        const conditionsMet = !question.conditions?.length || checkConditionsMet(question.conditions, answers);
        if (conditionsMet) {
            acc.push({...question, visibleIndex: acc.length + 1});
        }
        return acc;
    }, []);

    const user = useAppSelector(state => state.user.user);
    const isSeminarian = user ? hasRole(user, 'seminarian') : false;

    const sendSurvey = async () => {
        const isAllQuestion =
            visibleQuestions && visibleQuestions.length <= Object.keys(answers).length;

        if (!isAllQuestion) {
            Toast.show({
                type: 'info',
                text1: 'Ответь на все вопросы',
                position: 'bottom',
                bottomOffset: 50,
            });
            return;
        }

        try {
            if (isSeminarian && surveyId) {
                // Отправка для семинаристов (короткая форма)
                await dispatch(sendSurveyAnswers({
                    answers,
                    report_survey_id: surveyId,
                    user_id: authState?.userId!,
                })).unwrap();
                await dispatch(fetchMySurveyAbout({userId: user?.id!})).unwrap()

                // Переход на экран "Мои опросы"
                // @ts-ignore
                navigation.navigate(ROUTES.MY_SURVEY);

                Toast.show({
                    type: 'success',
                    text1: 'Опрос отправлен!',
                    position: 'bottom',
                    bottomOffset: 50,
                });

                return;
            }

            // Отправка обычного опроса
            await dispatch(sendSurveyAnswers({
                answers,
                report_survey_id: 11,
                surveyId: data?.settings?.surveyId?.toString()!,
                user_id: authState?.userId!,
            })).unwrap();

            // Отмечаем как завершённый
            await dispatch(markSurveyCompleted({
                userId: authState?.userId!,
                lessonId: lesson?.data?.id!,
            })).unwrap();

            // Получаем список уроков
            const lessons = await dispatch(fetchThemeLessons({
                groupId: groupID!,
                type,
                themeId: lesson?.data?.theme_id!,
            })).unwrap();

            if (lessons.data?.length === 1 && lessons.data[0]?.type === 'control') {
                dispatch(fetchControlWork(lessons.data[0]?.work_id));
                // @ts-ignore
                navigation.navigate(ROUTES.CONTROL_WORK);
            } else {
                dispatch(fetchLessonData({
                    lessonId: lesson?.data?.id!,
                    groupId: groupID!,
                    type,
                }));
            }

            setIsSurveySubmitted(true);

            Toast.show({
                type: 'success',
                text1: 'Опрос отправлен!',
                position: 'bottom',
                bottomOffset: 50,
            });
        } catch (error: any) {
            const message =
                Array.isArray(error?.error) && error.error.length > 0
                    ? error.error[0]
                    : error?.message || 'Что-то пошло не так';

            Toast.show({
                type: 'error',
                text1: 'Ошибка при отправке',
                text2: message,
                position: 'bottom',
                bottomOffset: 50,
            });
        }
    };


    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prevAnswers => {
            const newAnswers = {
                ...prevAnswers,
                [questionId]: value,
            };

            data?.questions.forEach(question => {
                if (!question.conditions || question.conditions.length === 0) return;

                const isDependent = question.conditions.some(cond => cond.questionId === questionId);
                if (!isDependent) return;

                const conditionsMet = checkConditionsMet(question.conditions, newAnswers);

                if (!conditionsMet) {
                    delete newAnswers[question.id];

                    if (question.questions && question.questions.length > 0) {
                        question.questions.forEach(subQ => {
                            delete newAnswers[subQ.id];
                        });
                    }
                }
            });

            return newAnswers;
        });
    };

    const renderQuestion = (question: SurveyQuestion, index: number) => {
        // Проверка условий
        if (question.conditions?.length) {
            const conditionsMet = checkConditionsMet(question.conditions, answers);
            if (!conditionsMet) return <Text>не показывается</Text>;
        }

        // Получаем финальный вопрос (вложенный или сам)
        const actualQuestion = question.questions?.[0] || question;

        // Вытаскиваем нужные данные
        const {type, id} = actualQuestion;
        const value = answers[id];
        const onChange = (value: any) => handleAnswerChange(id, value);

        // Рендер по типу
        switch (type) {
            case 'test':
                return (
                    <TestQuestion
                        key={id}
                        question={actualQuestion}
                        index={index}
                        value={value}
                        onChange={onChange}
                    />
                );
            case 'detailedAnswer':
                return (
                    <DetailedAnswerQuestion
                        key={id}
                        question={actualQuestion}
                        index={index}
                        value={value}
                        onChange={onChange}
                    />
                );
            case 'range':
                return (
                    <RangeQuestion
                        key={id}
                        question={actualQuestion}
                        index={index}
                        value={value}
                        onChange={onChange}
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <ActivityIndicator/>;
    }

    if (error) {
        return (
            <View>
                <Text>Ошибка при загрузке опроса: {error}</Text>
            </View>
        );
    }


    return (
        <>
            {isSurveySubmitted ? (
                <ScrollView style={{backgroundColor: Colors.white}}>
                    <CoursesHeader title={"Опрос пройден"}/>
                    <View style={{alignItems: 'center', padding: 20}}>
                        <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>Вы прошли опрос</Text>
                        <Text style={{fontSize: 16, textAlign: 'center', marginBottom: 20}}>
                            Благодарим вас за пройденный опрос
                        </Text>
                        <Image source={require('../assets/Table.png')} style={{width: 300, height: 400}}
                               resizeMode="contain"/>
                    </View>
                </ScrollView>
            ) : (
                <ScrollView style={{backgroundColor: Colors.white}}>
                    <CoursesHeader title={"Пройти опрос"}/>
                    <View style={{paddingHorizontal: 15}}>
                        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Опрос: {data?.settings.name}</Text>
                        <Text style={{fontSize: 16, marginVertical: 10}}>{data?.settings.theme}</Text>
                    </View>

                    <View>
                        {visibleQuestions?.map((question, index) => (
                            <View key={question.id}>
                                {renderQuestion(question, index)}
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={GlobalStyle.btnOpenFile} onPress={sendSurvey}>
                        {reportLoading ? <ActivityIndicator size={'small'}/> : <Text>Отправить ответы</Text>}
                    </TouchableOpacity>
                </ScrollView>
            )}
            <Toast config={toastConfig}/>
        </>

    );
};


const checkConditionsMet = (
    conditions: SurveyCondition[], // тип condition из question.conditions
    answers: Record<string, any>
): boolean => {
    // some - для любого совпадения
    // every - для точного совпадения всех условий
    return conditions.some(condition => {
        const answer = answers[condition.questionId];

        if (answer === undefined || answer === null) return false;

        const conditionValueNum = Number(condition.value);
        const isNumericCondition = !isNaN(conditionValueNum);

        if (condition.field === 'range' && isNumericCondition) {
            const answerNum = Number(answer);
            return !isNaN(answerNum) && answerNum < conditionValueNum;
        }

        return Array.isArray(answer)
            ? answer.includes(condition.value)
            : answer === condition.value;
    });
};