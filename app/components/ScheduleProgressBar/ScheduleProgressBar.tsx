import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';

const walkingPersonImage = require('../../assets/progressImg.png');

type ScheduleProgressBarProps = {
    progress: number
}

export const ScheduleProgressBar = ({progress}: ScheduleProgressBarProps) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const animatedWidth = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <Animated.Image
                source={walkingPersonImage}
                style={[
                    styles.walkingPerson,
                    {
                        left: animatedValue.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['3%', '95%'], // Максимальная ширина прогресса
                        }),
                    },
                ]}
            />
            <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressBar, {width: animatedWidth}]}/>
            </View>
            <Text style={styles.progressText}>{progress}% пройдено</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    progressContainer: {
        height: 10,
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#7acbff',
    },
    walkingPerson: {
        position: 'absolute',
        bottom: 45, // Для того чтобы разместить персонажа выше полоски
        width: 30,
        height: 50,

    },
    progressText: {
        marginTop: 10,
        fontSize: 18,
        color: '#333',
    },
});
