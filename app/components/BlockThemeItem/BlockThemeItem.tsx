import React from 'react';
import {Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import Svg, {Path} from "react-native-svg";
import {Colors} from "../../constants/Colors.ts";
import {RFValue} from "react-native-responsive-fontsize";
import {BlockTheme,} from "../../redux/slises/blockThemesSlice.ts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../../constants/Routes.ts";
import {fetchLessonData} from "../../redux/slises/lessonSlice.ts";
import Toast from "react-native-toast-message";
import {fetchControlWork} from "../../redux/slises/controlWorkSlice.ts";
import {fetchThemeLessons, LessonType} from "../../redux/slises/themeLessonsSlice.ts";
import {BlockThemesScreen} from "../../screens/BlockThemesScreen.tsx";

type ScheduleDetailCardProps = {
    blockTheme: BlockTheme,
    index: number
}

export const BlockThemeItem: React.FC<ScheduleDetailCardProps> = (
    {blockTheme}
) => {
     console.log('BlockThemeItem', blockTheme)
    const {groupID, type} = useAppSelector(state => state.studentCourses);
    const progress = (Number(blockTheme.finishedCount ?? 0) / Number(blockTheme.totalCount ?? 1)) * 100;
    const dispatch = useAppDispatch()
    const navigation = useNavigation()
    let status = ''
    if (blockTheme.isActive === 0) {
        status = "Недоступно"
    } else {
        status = +blockTheme.finishedCount === blockTheme.totalCount ? "Пройдено" : "В процессе";
    }


    const fetchWork = async () => {
        if (!blockTheme.isActive) {
            Toast.show({
                type: 'info',
                text1: 'Нет доступа!',
                text2: 'Выбери другую тему!',
                position: 'bottom',
                bottomOffset: 50,
            });
            return
        }
        if (!groupID) {
            Toast.show({
                type: 'info',
                text1: 'Нет groupID!',
                position: 'bottom',
                bottomOffset: 50,
            });
            return;
        }

        try {
            const lessons = await dispatch(
                fetchThemeLessons({type, groupId: groupID, themeId: blockTheme.id})
            ).unwrap();
            if (!lessons.data?.length) {
                console.warn("Нет данных об уроках");
                return;
            }

            const lesson = lessons.data.find((les: LessonType) => les.isActive);
            //  console.log(lesson)

            switch (lesson.type) {
                case 'control':
                    dispatch(fetchControlWork(lesson.work_id));
                    // @ts-ignore
                    navigation.navigate(ROUTES.CONTROL_WORK);
                    break;

                case 'topic':
                    dispatch(fetchLessonData({groupId: groupID, type, lessonId: lesson.id}));
                    // @ts-ignore
                    navigation.navigate(ROUTES.LESSON);
                    break;

                case 'probe':
                    Toast.show({
                        type: 'info',
                        text1: 'В разработке',
                        text2: 'Функционал пробных работ в разработке',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                    break;

                default:
                    console.warn(`Неизвестный тип урока: ${lesson.type}`);
                    break;
            }
        } catch (error) {
            console.error("Ошибка загрузки уроков:", error);
        }


        //    console.log(scheduleDetail)
        // if (!scheduleDetail.isActive) {
        //     Toast.show({
        //         type: 'info',
        //         text1: 'Нет доступа!',
        //         text2: 'Выбери другую тему!',
        //         position: 'bottom',
        //         bottomOffset: 50,
        //     });
        //     return
        // }
        //
        // const actions = {
        //     home: () => {
        //         if (!lesson.length > 0) {
        //             Toast.show({
        //                 type: 'info',
        //                 text1: 'Нет доступа!',
        //                 text2: 'Уроки еще не добавлены! Обратитесь к преподавателю!',
        //                 position: 'bottom',
        //                 bottomOffset: 50,
        //             });
        //             return
        //         }
        //
        //        dispatch(fetchLessonData({
        //             groupId: data?.group ? groupId : data?.direction_id,
        //             lessonId: lesson[0].lesson?.id,
        //             isPrivate
        //         }));
        //         // @ts-ignore
        //         navigation.navigate(ROUTES.LESSON, {
        //             params: {
        //                 title: scheduleDetail.name,
        //                 groupId: groupId,
        //                 course_id,
        //                 direction_id,
        //                 material_id,
        //                 lessonId: lesson[0].lesson?.id
        //             }
        //         });
        //     },
        //     control: () => {
        //         dispatch(fetchControlWork(scheduleDetail.id));
        //         navigation.navigate(ROUTES.CONTROL_WORK)
        //         // dispatch(fetchControlWork({controlId: controlWork.id}));
        //         // navigation.navigate(ROUTES.CONTROL_WORK, {
        //         //     params: {
        //         //         title: scheduleDetail.name,
        //         //         controlId: controlWork.id,
        //         //         groupId: groupId
        //         //     }
        //         // });
        //     },
        //     probe: () => {
        //         Toast.show({
        //             type: 'info',
        //             text1: 'В разработке',
        //             text2: 'Функционал пробных работ в разработке',
        //             position: 'bottom',
        //             bottomOffset: 50,
        //         });
        //     },
        //     colloquium: () => {
        //         Toast.show({
        //             type: 'info',
        //             text1: 'В разработке',
        //             text2: 'Функционал коллоквиумов в разработке',
        //             position: 'bottom',
        //             bottomOffset: 50,
        //         });
        //     },
        // };
        //
        // if (scheduleDetail.url.includes('my')) {
        //     actions.home(); // Вызов действия для homework
        // } else if (scheduleDetail.url.includes('control')) {
        //     actions.control(); // Вызов действия для control work
        // } else if (scheduleDetail.url.includes('probe')) {
        //     actions.probe(); // Вызов действия для probe work
        // } else if (scheduleDetail.url.includes('colloquium')) {
        //     actions.colloquium(); // Вызов действия для probe work
        // } else {
        //     console.error('Unknown work type');
        // }
    };


    return (
        <TouchableOpacity
            //  disabled={blockTheme.isActive === 0}
            style={{flex: 1, marginBottom: 15, paddingHorizontal: 10, opacity: !blockTheme.isActive ? 0.5 : 1}}
            onPress={fetchWork}>
            <LinearGradient colors={['#fff', '#f3efef', '#f0f9ff', '#e9f6ff']} style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>{blockTheme.name}</Text>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
                        // @ts-ignore
                         xmlns="http://www.w3.org/2000/svg">
                        <Path d="M8.59 16.34L13.17 12 8.59 7.66L10 6.25L16 12.25L10 18.25L8.59 16.34Z" fill="#2B2D3E"/>
                    </Svg>
                </View>
                <View style={styles.progressContainer}>
                    <Text style={styles.totalText}>{blockTheme.finishedCount} </Text>
                    <Text style={styles.totalText}>из {blockTheme.totalCount}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={{...styles.progressBar, width: `${progress}%`}}/>
                </View>
                <Text style={styles.time}>{status}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 12,
        padding: 11,
        borderWidth: 1,
        borderColor: Colors.background,
        gap: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: RFValue(14, 680),
        fontWeight: 'bold',
        color: Colors.colorBlack,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    progressText: {
        fontSize: 16,
        color: '#2B2D3E',
    },
    totalText: {
        fontSize: RFValue(13, 680),
        color: '#2B2D3E',
        // marginLeft: '20%',
    },
    progressBarContainer: {
        // width: '80%',
        height: 5,
        backgroundColor: '#d0e0ff',
        borderRadius: 5,
    },
    progressBar: {
        height: 5,
        backgroundColor: Colors.colorGreenLight,
        borderRadius: 5,
    },
    image: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    time: {
        color: '#8b95a5',
    },
});

