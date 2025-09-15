import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Colors} from "../../constants/Colors.ts";
import Toast from "react-native-toast-message";
import {LessonType} from "../../redux/slises/themeLessonsSlice.ts";

type LessonNavigationProps = {
    lessons?: LessonType[],
    currentLessonId?: number,
    onLessonSelect: (lesId: number) => void,
    allLessons?: any,
   // courseVisibility: number | undefined,
}

export const LessonNavigation = (
    {lessons, currentLessonId, onLessonSelect, allLessons, }: LessonNavigationProps) => {

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.scrollView}>
            {lessons?.map((item) => {
                //const isActiveLesson = allLessons?.find(el => el.lesson.id === item.id)?.status === 1

                return (
                    <TouchableOpacity
                        disabled={!item?.isActive}
                      //  disabled={!isActiveLesson && courseVisibility !== 1}
                        key={item.id}
                        onPress={() => {
                            // if (!isActiveLesson) {
                            //     Toast.show({
                            //         type: 'info',
                            //         text1: 'Нет доступа',
                            //         position: 'bottom',
                            //         bottomOffset: 50,
                            //         text2: 'Сначала сдай домашку!',
                            //     });
                            //     return
                            // }
                            onLessonSelect(item.id)
                        }}
                        style={[styles.card,
                            !item?.isActive ? styles.disabledButton : null,
                            {
                            backgroundColor: item.id === currentLessonId ? '#f1e6f6' : Colors.white,

                            //  opacity: !isActiveLesson && courseVisibility !== 1 ? 0.3 : 1
                         //   opacity: !isActiveLesson ? 0.3 : 1
                        }]}
                    >
                        <Text style={styles.title}>{item.name}</Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        marginBottom: 20,
    },
    disabledButton: {
        opacity: 0.5,  // уменьшенная прозрачность для disabled
    },
    card: {
        borderWidth: 1,
        borderColor: Colors.colorGreyNd,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginHorizontal: 5,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
    },
});
