import React, {useEffect, useState} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View, GestureResponderEvent} from "react-native";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import {Colors} from "../../constants/Colors.ts";
import {Audio} from "expo-av";
import {Easing} from "react-native-reanimated";
import {getUrl} from "../../settings/utils.ts";

type AudioComponentProps = {
    audioFile: {
        file_path: string,
        id: number,
        task_id: number,
        type: string,
    }
}

export const AudioComponent = ({audioFile}: AudioComponentProps) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const pulseAnim = useState(new Animated.Value(1))[0]; // Для анимации пульсации
    const [progress, setProgress] = useState(0); // Процент загрузки
    const [url, setUrlState] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };

        fetchUrl();
    }, []);

    useEffect(() => {
        return () => {
            // Очищаем звук при размонтировании компонента
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    };

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const playAudio = async () => {
        if (!sound) {
            // Создаем новый звук
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: `${url}${audioFile.file_path}` });
            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.isLoaded) {
                    setCurrentPosition(status.positionMillis);
                    setDuration(status.durationMillis);
                    setProgress((status.positionMillis / status.durationMillis) * 100);
                }

                if (status.didJustFinish) {
                    // Сбрасываем прогресс и позицию в случае завершения трека
                    setIsPlaying(false);
                    setSound(null)
                    setCurrentPosition(0);  // Сбросить позицию в начало
                    setProgress(0);  // Обнулить прогресс
                    pulseAnim.stopAnimation();
                }
            });

            await newSound.playAsync();
            startPulseAnimation();
        } else {

            if (isPlaying) {
                // Если аудио воспроизводится, ставим его на паузу
                await sound.pauseAsync();
                setIsPlaying(false);
                pulseAnim.stopAnimation();
            } else {
                // Если аудио закончилось, воспроизводим его заново
                // if (currentPosition >= duration || currentPosition === 0) {
                //     await sound.setPositionAsync(0);  // Устанавливаем позицию в начало
                //     setCurrentPosition(0);  // Обновляем состояние позиции
                //     setProgress(0);  // Сбрасываем прогресс
                // }
                await sound.playAsync();  // Начинаем воспроизведение
                setIsPlaying(true);
                startPulseAnimation();
            }
        }
    };

    const onProgressBarPress = async (e: GestureResponderEvent) => {
        if (!sound || duration === 0) return;

        const { locationX } = e.nativeEvent;

        // Измеряем прогресс-бар, чтобы получить его ширину
        e.currentTarget.measure((fx, fy, width, height, px, py) => {
            const progressBarWidth = width;  // Ширина прогресс-бара
            const newProgress = locationX / progressBarWidth;  // Процент, где нажали
            const newPosition = newProgress * duration;  // Новая позиция в миллисекундах

            // Устанавливаем новую позицию звука
            sound.setPositionAsync(Math.floor(newPosition)).then(() => {
                setCurrentPosition(Math.floor(newPosition));  // Обновляем текущее время
                setProgress(newProgress * 100);  // Обновляем прогресс
            });
        });
    };

    return (
        <View key={audioFile.file_path}>
            <Text style={styles.audioLabel}>Прослушайте аудиодорожку:</Text>
            <View style={styles.audioContainer}>
                <TouchableOpacity onPress={playAudio} style={styles.iconWrapper}>
                    <Animated.View style={[styles.iconWrapperBlock, isPlaying && { transform: [{ scale: pulseAnim }] }]}>
                        <Icon
                            name={isPlaying ? 'pause' : 'play'}
                            size={15}
                            color="#fff"
                        />
                    </Animated.View>
                </TouchableOpacity>

                <View style={styles.progressContainer}>
                    <Text style={styles.timeText}>{formatTime(currentPosition)} / {formatTime(duration)}</Text>
                    <View style={styles.progressBar} onStartShouldSetResponder={() => true} onResponderRelease={onProgressBarPress}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    audioContainer: {
        flexDirection: 'row',
        marginVertical: 15,
        alignItems: 'center',
        gap: 15
    },

    audioLabel: {
        marginTop: 10,
        fontSize: 16,
    },
    iconWrapper: {
        width: 45,
        height: 45,
        borderRadius: 30,
        backgroundColor: Colors.backgroundPurple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapperBlock: {

    },
    progressContainer: {
        flex: 1,
    },
    progressBar: {
        height: 15,
        backgroundColor: Colors.colorWhite,
        borderRadius: 5,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.backgroundPurple,
        borderRadius: 5,
    },
    timeText: {
        textAlign: 'center',
        marginBottom: 5,
    },
});
