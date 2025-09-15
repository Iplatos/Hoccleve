import React, { useEffect, useState } from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Colors} from "../../constants/Colors.ts";
import {useAppSelector} from "../../redux/hooks.ts";

// Определение типов для пропсов
type TimerControlProps = {
    handleStartPause: () => void;
    buttonText: string;
    isRunning: boolean;
    handleSubmitControlWork: () => void;
};

// Компонент с типизацией
const TimerControl: React.FC<TimerControlProps> = ({  handleStartPause, handleSubmitControlWork, buttonText, isRunning }) => {
    const [timeLeft, setTimeLeft] = useState(14400); // Начальное значение 4 часа в секундах
    const {data, loading, error} = useAppSelector(state => state.controlWork);

    useEffect(() => {
        if (data?.left_time > 0) {
            setTimeLeft(data?.left_time)
        } else {
            setTimeLeft(14000)
        }
    }, [data?.left_time]);

    useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(timer);
            handleSubmitControlWork();  // Вызов функции для сдачи контрольной работы при истечении времени
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const formatTime = (time: number): string => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.topSection}>
            <TouchableOpacity style={styles.button} onPress={handleStartPause}>
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        </View>
    );
};

export default React.memo(TimerControl);

const styles = StyleSheet.create({

    topSection: {
        paddingHorizontal: 15,
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

});
