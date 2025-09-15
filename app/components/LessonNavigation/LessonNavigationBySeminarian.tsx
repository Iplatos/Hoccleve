import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from "react-native";
import {Colors} from "../../constants/Colors.ts";
import {LessonType} from "../../redux/slises/themeLessonsSlice.ts";
import {useAppDispatch} from "../../redux/hooks.ts";
import {fetchLessonData} from "../../redux/slises/lessonSlice.ts";


type LessonNavigationPropsBySeminarian = {
    currentLessonId: number,
    allLessons?: LessonType[],
}

export const LessonNavigationBySeminarian = ({currentLessonId, allLessons}: LessonNavigationPropsBySeminarian) => {
    const dispatch = useAppDispatch();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.scrollView}>
            {allLessons?.map((item) => {
                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                            dispatch(fetchLessonData({lessonId: item.id}));
                        }}
                        style={[styles.card,
                            {
                                backgroundColor: item.id === currentLessonId ? '#f1e6f6' : Colors.white,
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
        opacity: 1,
    },
    card: {
        borderWidth: 1,
        borderColor: Colors.colorGreyNd,
        paddingHorizontal: 15,
        paddingVertical: 5,
        paddingBottom: 15,
        marginHorizontal: 5,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
    },
});
