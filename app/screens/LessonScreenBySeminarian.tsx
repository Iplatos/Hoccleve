import React from 'react';
import {FlatList, StyleSheet, Text, View} from "react-native";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {Colors} from "../constants/Colors.ts";
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {LessonNavigationBySeminarian} from "../components/LessonNavigation/LessonNavigationBySeminarian.tsx";
import {CheckPassWordsComponent} from "../components/TestComponents/CheckBySeminarian/CheckPassWordsComponent.tsx";
import {CheckExactAnswerComponent} from "../components/TestComponents/CheckBySeminarian/CheckExactAnswerComponent.tsx";
import {CheckTestComponent} from "../components/TestComponents/CheckBySeminarian/CheckTestComponent.tsx";
import {CheckMatchComponent} from "../components/TestComponents/CheckBySeminarian/CheckMatchComponent.tsx";
import {CheckFileAnswerComponent} from "../components/TestComponents/CheckBySeminarian/CheckFileAnswerComponent.tsx";
import {CheckOrderComponent} from "../components/TestComponents/CheckBySeminarian/CheckOrderComponent.tsx";
import {LessonTask} from "../redux/slises/homeworkSlice.ts";
import {
    CheckDetailAnswerComponent
} from "../components/TestComponents/CheckBySeminarian/CheckDetailAnswerComponent.tsx";
import {BlocksRenderer} from "../components/BlocksRenderer/BlocksRenderer.tsx";
import {SurveyCard} from "../components/SurveyCard/SurveyCard.tsx";
import {createSurveyReport, fetchSurvey} from "../redux/slises/surveySlice.ts";
import {ROUTES} from "../constants/Routes.ts";
import {useAuth} from "../context/AuthContext.tsx";
import {useNavigation} from "@react-navigation/native";
import {GlobalStyle} from "../constants/GlobalStyle.ts";
import {
    CheckBasketAnswerComponent
} from "../components/TestComponents/CheckBySeminarian/CheckBasketAnswerComponent.tsx";
import {
    CheckMultipleChoiceComponent
} from "../components/TestComponents/CheckBySeminarian/CheckMultipleChoiceComponent.tsx";

export const LessonScreenBySeminarian = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const {authState} = useAuth()

    const lesson = useAppSelector(state => state.lesson.data);
    const allLessons = useAppSelector(state => state.themeLessons.data);

    const filteredLessons = lesson?.lessonTasks?.slice().sort((a, b) => {
        return Number(a.sorting) - Number(b.sorting);
    });
    // console.log('lesson', lesson)


    const renderTaskItem = ({item, index}: { item: LessonTask; index: number }) => {
        const {type} = item.task;
        console.log(type, index)
        switch (type) {
            case 'pass-words':
                return <CheckPassWordsComponent task={item.task} index={index}/>;
            case 'exact-answer':
                return <CheckExactAnswerComponent task={item.task} index={index}/>;
            case 'test':
                return <CheckTestComponent task={item.task} index={index}/>;
            case 'match':
                return <CheckMatchComponent task={item.task} index={index}/>;
            case 'file-answer':
                return <CheckFileAnswerComponent task={item.task} index={index}/>;
            case 'order':
                return <CheckOrderComponent task={item.task} index={index}/>;
            case 'detail-answer':
                return <CheckDetailAnswerComponent task={item.task} index={index}/>;
            case 'basket':
                return <CheckBasketAnswerComponent task={item.task} index={index}/>;
            case 'multiple-choice':
                return <CheckMultipleChoiceComponent task={item.task} index={index}/>;
            default:
                return (
                    <View>
                        <Text>Неизвестный тип {type}</Text>
                    </View>
                );
        }
    };

    const createSurveyHandler = async () => {
        try {
            const lessonId = lesson?.id;
            const surveyId = lesson?.lessonSurvey?.id
            if (!lessonId) {
                return;
            }
            if (!surveyId) {
                throw new Error("Параметр 'survey_id' обязателен");
            }
            // Отправляем запрос на создание отчета
            if (authState?.userId != null) {
                await dispatch(
                    createSurveyReport({
                        openLesson: 1,
                        forLesson: Number(lessonId),
                        survey_id: surveyId,
                        user_id: authState?.userId
                    })
                ).unwrap();
            }

            // Проверяем, есть ли survey_id в ответе
            if (!surveyId) {
                throw new Error("Параметр 'survey_id' обязателен");
            }

            // Запрашиваем данные опроса
            await dispatch(fetchSurvey(+surveyId)).unwrap();

            // @ts-ignore
            navigation.navigate(ROUTES.SURVEY);
        } catch (error: any) {
            //console.error("Ошибка запроса:", error);

            // Определяем текст ошибки
            const errorMessage =
                error?.error?.[0] || error?.message || "Произошла ошибка";

            // Показываем Toast с сообщением
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: errorMessage,
                position: 'bottom',
                bottomOffset: 50,
            });
        }
    }
    return (
        <>
            <Toast config={toastConfig}/>
            <View style={styles.container}>
                <FlatList
                    ListHeaderComponent={
                        <>
                            <CoursesHeader title={lesson?.name}/>
                            <LessonNavigationBySeminarian
                                allLessons={allLessons}
                                currentLessonId={lesson?.id!}
                            />
                            <BlocksRenderer blocksData={lesson?.blocks!}/>
                            <Text style={[GlobalStyle.titleGL, {textAlign: "center", marginVertical: 5}]}>Домашнее
                                задание к уроку</Text>
                        </>
                    }
                    ListFooterComponent={
                        <>
                            {lesson?.lessonSurvey && <SurveyCard
                                title={lesson?.lessonSurvey.title}
                                description={lesson?.lessonSurvey.description}
                                //  isSurveyPassed={lesson?.data?.lessonSurvey.is_survey_passed}
                                isSurveyRequired={!!lesson?.survey_required}
                                onPress={createSurveyHandler}
                            />}

                        </>
                    }
                    data={filteredLessons}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTaskItem}
                />
            </View>
        </>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 0,
        backgroundColor: Colors.white,
        zIndex: -1
    },
});