import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {fetchVideoRating} from "../../redux/slises/videoRatingSlice.ts";
import {Colors} from "../../constants/Colors.ts";
import {submitVideoRating} from "../../redux/slises/submitRatingSlice.ts";
import Toast from "react-native-toast-message";
import axios from "axios";

type VideoRatingComponentProps = {
    videoId: number
}

const ratings = [
    {value: 15, icon: '🔥'},
    {value: 10, icon: '👍'},
    {value: 5, icon: '🤔'},
    {value: 0, icon: '👎'}
];

// Основной компонент
export const VideoRatingComponent = ({ videoId }: VideoRatingComponentProps) => {
    const dispatch = useAppDispatch();
    const videoRating = useAppSelector(state => state.videoRating);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);

    const loading = videoRating.status === 'loading';

  //  console.log(axios.defaults.baseURL)
    useEffect(() => {
        if (videoId) {
            dispatch(fetchVideoRating(videoId));
        }
    }, [dispatch, videoId]);

    useEffect(() => {
        if (videoRating.data && videoRating.data.length > 0) {
            setSelectedRating(videoRating.data[0].rating);
        } else {
            setSelectedRating(null);
        }
    }, [videoRating.data]);

    const handleRate = (value: number) => {
        if (videoId) {
            dispatch(submitVideoRating({ videoId, rating: value })).unwrap().then(() => {
                Toast.show({
                    type: 'success',
                    text1: 'Успешно',
                    text2: 'Оценка отправлена',
                    position: 'bottom',
                    bottomOffset: 50,
                });
                dispatch(fetchVideoRating(videoId));
            }).catch(() => {
                Toast.show({
                    type: 'error',
                    text1: 'Ошибка',
                    text2: 'Вы уже голосовали за данное видео',
                    position: 'bottom',
                    bottomOffset: 50,
                });
            });
        }
    };

    if (loading) {
        return <View style={{ alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
    }

    if (videoRating.status === 'failed') {
        return <Text>Error: {videoRating.error}</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.ratingContainer}>
                {ratings.map((rating) => (
                    <TouchableOpacity
                        key={rating.value}
                        onPress={() => handleRate(rating.value)}
                        style={selectedRating === rating.value ? styles.selected : styles.notSelected}
                    >
                        {loading ? <ActivityIndicator /> : <Text>{rating.icon}</Text>}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    ratingWrapper: {
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    selected: {
        borderRadius: 5,
        paddingHorizontal: 25,
        paddingVertical: 7,
        backgroundColor: Colors.colorAccent,
        alignItems: 'center',
        justifyContent: 'center'
    },
    notSelected: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e7e7e8',
        justifyContent: 'center',
        paddingHorizontal: 25,
        paddingVertical: 7,
    },
});


