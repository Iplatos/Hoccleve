import React from 'react';
import {Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import Svg, {Path} from "react-native-svg";
import {Colors} from "../../constants/Colors.ts";
import {DirectionItem} from "../../redux/slises/directionPlanSlice.ts";
import {RFValue} from "react-native-responsive-fontsize";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {useNavigation} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import {fetchBlockThemes} from "../../redux/slises/blockThemesSlice.ts";
import {ROUTES} from "../../constants/Routes.ts";
import {setBlockID} from "../../redux/slises/studentCoursesSlice.ts";

type CourseDetailCardProps = {
    courseDetail: DirectionItem,
    index: number;
}

export const CourseDetailCard: React.FC<CourseDetailCardProps> = ({courseDetail}) => {
 //   console.log('CourseDetailCard', courseDetail)
    const {groupID, type } = useAppSelector(state => state.studentCourses);
    const progress = (Number(courseDetail?.finishedCount) / Number(courseDetail?.totalCount)) * 100;
    const dispatch = useAppDispatch()
    const navigation = useNavigation()
    const status = courseDetail.finishedCount === courseDetail.totalCount ? "Выполнено" : "В процессе";
    const disabled = courseDetail.isActive === 0


    return (
        <TouchableOpacity
            style={{flex: 1, marginBottom: 15, paddingHorizontal: 10, opacity: disabled ? 0.5 : 1}}
            onPress={async () => {
                dispatch(setBlockID(Number(courseDetail.id)));
                if (disabled) {
                    Toast.show({
                        type: 'info',
                        text1: 'Нет доступа!',
                        text2: 'Выбери другую тему!',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                    return;
                }

                try {
                    const result = await dispatch(fetchBlockThemes({
                        groupId: groupID ?? undefined,
                        blockId: Number(courseDetail.id),
                        type
                    }));

                    if (fetchBlockThemes.fulfilled.match(result)) {
                        // @ts-ignore
                        navigation.navigate(ROUTES.BLOCK_THEMES, {
                            groupId: groupID ?? undefined,
                            blockId: Number(courseDetail.id),
                            type: type
                        });
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Ошибка!',
                            text2: 'Неизвестная ошибка',
                            position: 'bottom',
                            bottomOffset: 50,
                        });
                    }
                } catch (error) {
                    console.error('Ошибка запроса:', error);
                    Toast.show({
                        type: 'error',
                        text1: 'Ошибка!',
                        text2: 'Произошла ошибка. Попробуйте позже.',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                }
            }}
        >
            <LinearGradient colors={['#fff', '#f3efef', '#f0f9ff', '#e9f6ff']} style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>{courseDetail.name}</Text>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
                        // @ts-ignore
                         xmlns="http://www.w3.org/2000/svg">
                        <Path d="M8.59 16.34L13.17 12 8.59 7.66L10 6.25L16 12.25L10 18.25L8.59 16.34Z" fill="#2B2D3E"/>
                    </Svg>
                </View>
                <View style={styles.progressContainer}>
                    <Text style={styles.totalText}>{courseDetail.finishedCount} тема</Text>
                    <Text style={styles.totalText}>из {courseDetail.totalCount}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={{...styles.progressBar, width: `${progress}%`}}/>
                </View>
                <View>
                    <Text>{disabled ? 'Недоступно' : status}</Text>
                </View>
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
        justifyContent: 'space-between'
    },
    progressText: {
        fontSize: 16,
        color: '#2B2D3E',
    },
    totalText: {
        fontSize: RFValue(13, 680),
        color: '#2B2D3E',
        marginLeft: '20%',
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

