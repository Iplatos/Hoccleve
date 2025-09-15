import React, {useEffect, useState} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import YoutubePlayer from "react-native-youtube-iframe";
import WebView from "react-native-webview";

import {VideoRatingComponent} from "../VideoRatingComponent/VideoRatingComponent.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from "../../context/AuthContext.tsx";
import {LessonVideo} from "../../redux/slises/lessonSlice.ts";

type LessonVideoPlayerProps = {
    videos: LessonVideo[] | undefined,
    lessonName: string | undefined
}

export const LessonVideoPlayer = ({videos, lessonName}: LessonVideoPlayerProps) => {
    const [currentLessonVideoIndex, setCurrentLessonVideoIndex] = useState(0);
    const [videoId, setVideoId] = useState<null | string>(null);
    const [videoFile, setVideoFile] = useState<null | string>(null);
    const [rutubeLink, setRutubeLink] = useState<null | string>(null);
    const [url, setUtl] = useState<string | null>(null)
    const [playerKey, setPlayerKey] = useState(0);

    useEffect(() => {
        setPlayerKey((prev) => prev + 1); // Обновляем ключ при изменении videoId
    }, [videoId]);

    // Текущий урок может быть неопределен, поэтому добавим проверку
    const currentLesson = videos ? videos[currentLessonVideoIndex] : undefined;


    // Проверяем, есть ли URL для файла видео
    const videoFileUrl = videoFile ? `${url}/${videoFile}` : null;

    // Функция для извлечения ID видео с YouTube
    const extractVideoId = (link: string) => {
        const match = link?.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };

    // Проверка на RuTube ссылку
    const isRutubeLink = (link: string) => {
        return link?.includes('rutube.ru');
    };


    useEffect(() => {
        // Проверяем, что currentLesson?.link существует и не является строкой "null"
        if (currentLesson?.link && currentLesson.link !== "null") {
            if (isRutubeLink(currentLesson.link)) {
                setRutubeLink(currentLesson.link);
                setVideoId(null);
                setVideoFile(null);
            } else {
                const firstVideoId = extractVideoId(currentLesson.link);
                setVideoId(firstVideoId);
                setRutubeLink(null);
                setVideoFile(null);
            }
        } else if (currentLesson?.file) {
            setVideoFile(currentLesson.file);
            setVideoId(null);
            setRutubeLink(null);
        }
    }, [currentLesson]);


    useEffect(() => {
        const get = async () => {
            try {
                const value = await AsyncStorage.getItem(API_URL); // Получаем значение из AsyncStorage
                setUtl(value)
            } catch (error) {
                console.error('Error fetching value:', error); // Обработка ошибки, если возникнет
            }
        };
        get(); // Вызываем функцию
    }, []);

    return (
        <>
            {
                (videos?.length === 0 || videos === null) ? <></> : <>
                    <View style={styles.videoBlock}>
                        {videoId ? (
                            <YoutubePlayer
                                key={`youtube-player-${playerKey}`}
                                height={Platform.OS === 'ios' ? 220 : 200}
                                webViewStyle={{borderRadius: 10, marginBottom: 10}}

                                videoId={videoId} // Устанавливаем текущее видео с YouTube
                            />
                        ) : rutubeLink ? (
                            <WebView
                                style={{height: 210, borderRadius: 10, marginBottom: 10}}
                                source={{uri: rutubeLink}} // RuTube видео
                                mediaPlaybackRequiresUserAction={true}

                            />
                        ) : videoFileUrl ? (
                            <WebView
                                style={{height: 210, borderRadius: 10, marginBottom: 10}}
                                source={{
                                    html: `
                                            <html>
                                                <body style="margin:0;padding:0;overflow:hidden;">
                                                    <video 
                                                        width="100%" 
                                                        height="100%" 
                                                        controls 
                                                        controlsList="nodownload" 
                                                        style="border-radius:10px;"
                                                    >
                                                        <source src="${videoFileUrl}" type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </body>
                                            </html>
                                            `
                                }}
                                javaScriptEnabled={true}
                                mediaPlaybackRequiresUserAction={true} // Запрет автозапуска видео
                                allowsInlineMediaPlayback={false} // Запрещает встраивание видео
                            />
                        ) : (
                            <Text>Не удалось воспроизвести видео</Text>
                        )}

                        <View style={{padding: 10}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>{lessonName}</Text>
                            {videos?.map((video, ind) => {
                                const videoLinkId = extractVideoId(video.link);
                                return (
                                    <TouchableOpacity
                                        style={[styles.videoLinks, {backgroundColor: ind === currentLessonVideoIndex ? '#edf7ff' : '#fff'}]}
                                        key={ind}
                                        onPress={() => {
                                            if (isRutubeLink(video.link)) {
                                                setRutubeLink(video.link);
                                                setVideoId(null);
                                                setVideoFile(null);
                                            } else if (video.link) {
                                                setVideoId(videoLinkId);
                                                setRutubeLink(null);
                                                setVideoFile(null);
                                            } else if (video.file) {
                                                setVideoFile(video.file);
                                                setRutubeLink(null);
                                                setVideoId(null);
                                            }
                                            setCurrentLessonVideoIndex(ind);
                                        }}>
                                        <Text>{video.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    {/* Рейтинг урока */}
                    <VideoRatingComponent videoId={videos && +videos[currentLessonVideoIndex]?.id}/>
                </>
            }

        </>

    );
};

const styles = StyleSheet.create({
    videoBlock: {
        borderWidth: 1,
        borderColor: '#e7e7e8',
        borderRadius: 8,
    },
    videoLinks: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e7e7e8',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 7
    },
    container: {
        borderWidth: 1,
        borderColor: '#e7e7e8',
        borderRadius: 8,
        marginBottom: 10,
    },
    youtube: {
        borderRadius: 10,
        marginBottom: 10,
    },
    webView: {
        height: 210,
        borderRadius: 10,
        marginBottom: 10,
    },
});
