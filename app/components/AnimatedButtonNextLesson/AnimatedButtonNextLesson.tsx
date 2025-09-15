import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Text, TouchableOpacity} from 'react-native';
import {useAppDispatch} from "../../redux/hooks.ts";
import ArrowRightIcon from "../../assets/icons/Arrow-right.tsx";
import {Colors} from "../../constants/Colors.ts";

export const AnimatedButtonNextLesson = ({isVisible, nextLessonId, groupId, onPressNextLessonHandler}: {
    groupId: number,
    isVisible: boolean,
    nextLessonId: number | null | undefined,
    onPressNextLessonHandler: () => void
}) => {

    const translateY = useRef(new Animated.Value(0)).current;
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (isVisible) {
            // Анимация вверх и вниз
            Animated.loop(
                Animated.sequence([
                    Animated.timing(translateY, {
                        toValue: -5, // подъем на 10 единиц
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: 0, // возврат в исходное положение
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        }
    }, [isVisible]);

    return isVisible ? (
        <Animated.View style={{transform: [{translateY}], marginBottom: 10}}>
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'green',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                }}
                onPress={() => {
                    onPressNextLessonHandler()
                    // dispatch(fetchLessonData({groupId: groupId, lessonId: nextLessonId}))
                }}
            >
                <Text style={{color: 'white', textAlign: 'center'}}>Вам доступен следующий урок</Text>
                <ArrowRightIcon color={Colors.colorWhite}/>
            </TouchableOpacity>
        </Animated.View>
    ) : null;
};



