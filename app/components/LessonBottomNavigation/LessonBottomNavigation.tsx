import React, {useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ArrowRightIcon from "../../assets/icons/Arrow-right.tsx";
import ArrowLeftIcon from "../../assets/icons/Arrow-left.tsx";
import {useAppSelector} from "../../redux/hooks.ts";
import Toast from "react-native-toast-message";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../../constants/Routes.ts";

type LessonBottomNavigationProps = {
    shouldBlockLessonsDueToUncompletedSurvey: boolean | undefined | null,
    isAccessToNextLessonAllowed: boolean;
    accessTooltip: string | null;
    prevLessonId?: number | undefined | null,
    nextLessonId?: number | undefined | null,
    prevButtonTitle: string,
    nextButtonTitle: string,
    nextLessonHandler: (lessonId: number | null | undefined) => void
    prevLessonHandler: (lessonId: number | null | undefined) => void
}
export const LessonBnnottomNavigation = (
    {
        shouldBlockLessonsDueToUncompletedSurvey,
        isAccessToNextLessonAllowed,
        accessTooltip,
        prevLessonId,
        prevLessonHandler,
        nextLessonHandler,
        prevButtonTitle,
        nextButtonTitle,

        nextLessonId
    }: LessonBottomNavigationProps) => {
    const navigation = useNavigation();
    const lesson = useAppSelector(state => state.lesson);

    const {status} = useAppSelector(state => state.lesson);
    const [loadingButton, setLoadingButton] = useState<'prev' | 'next' | null>(null); // Состояние для отслеживания нажатой кнопки
    const loading = status === 'loading';

    const isAccessToPreviousLessonAllowed = !!lesson?.data?.prev_lesson?.lessonId && !!lesson?.data?.prev_lesson?.themeId && !!lesson?.data?.prev_lesson?.blockId;
    const isDisabled = !isAccessToPreviousLessonAllowed || !!lesson?.data?.first_in_course;


    const handlePrevLesson = () => {
        setLoadingButton('prev'); // Устанавливаем кнопку как "предыдущую"
        prevLessonHandler(prevLessonId);
    };

    const handleNextLesson = () => {
        if (nextButtonTitle === 'Конец обучения') {
            // @ts-ignore
            navigation.navigate(ROUTES.COURSES);
            return
        }
        setLoadingButton('next'); // Устанавливаем кнопку как "следующую"
        nextLessonHandler(nextLessonId);
    };

    // // Показать Toast с tooltip, если доступ к уроку ограничен
    // if (!isAccessToNextLessonAllowed && tooltip) {
    //     Toast.show({
    //         type: 'info',
    //         text1: 'Ошибка',
    //         text2: tooltip,
    //         position: 'bottom',
    //         bottomOffset: 50,
    //     });
    // }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    isDisabled ? styles.disabledButton : null,
                ]}
                disabled={isDisabled}
                onPress={handlePrevLesson}
            >
                {
                    loading && loadingButton === 'prev'
                        ? <ActivityIndicator/>
                        : <>
                            <ArrowLeftIcon/>
                            <Text>{prevButtonTitle}</Text>
                        </>
                }

            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.button,
                 //   !isAccessToNextLessonAllowed ? styles.disabledButton : null, // Применяем стиль для отключенной кнопки
                ]}
               // disabled={!isAccessToNextLessonAllowed}
                onPress={handleNextLesson}
            >
                {loading && loadingButton === 'next' ? (
                    <ActivityIndicator/>
                ) : (
                    <>
                        <Text>{nextButtonTitle}</Text>
                        <ArrowRightIcon/>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10
    },
    button: {
        width: '50%',
        flexDirection: 'row',
        backgroundColor: '#f1e6f6',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    disabledButton: {
        opacity: 0.5,  // уменьшенная прозрачность для disabled
    },
});
