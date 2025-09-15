import React, {useCallback, useEffect, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import {fetchAllCourses} from "../redux/slises/CoursesSlise.ts";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {useAuth} from "../context/AuthContext.tsx";
import {useNavigation} from "@react-navigation/native";
import {fetchDirectionPlan} from "../redux/slises/directionPlanSlice.ts";
import {ROUTES} from "../constants/Routes.ts";
import {LinearGradient} from "expo-linear-gradient";
import Svg, {Path} from "react-native-svg";
import {Colors} from "../constants/Colors.ts";
import {
    fetchStudentCourses, setBlockID,
    setCourseID,
    setGroupID,
    setType,
    StudentCourse
} from "../redux/slises/studentCoursesSlice.ts";
import {compareToday, formateDate} from "../settings/utils.ts";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {fetchBlockThemes} from "../redux/slises/blockThemesSlice.ts";

export const CoursesScreen = () => {
    const dispatch = useAppDispatch()
    const {authState} = useAuth()
    const {studentCourses, allCourses, loading, error} = useAppSelector(state => state.courses);
    const [showStudentCourses, setShowStudentCourses] = useState(false);
    const {courses: userCurses, status} = useAppSelector(state => state.studentCourses);

    const filteredUserCourses = userCurses.filter(el => !!el.direction)

    // Состояние для отслеживания состояния рефреша
    const [refreshing, setRefreshing] = useState(false);


    const loadStudentCourses = () => {
        dispatch(fetchStudentCourses());
        setShowStudentCourses(true);
    };


    const loadAllCourses = () => {
        dispatch(fetchAllCourses());
        setShowStudentCourses(false);
    };

    // Функция для обновления данных при рефреше
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        dispatch(fetchAllCourses())
            .finally(() => setRefreshing(false));

    }, [dispatch]);

    useEffect(() => {
        setShowStudentCourses(true);
    }, []);


    if (error) {
        return <Text>Ошибка: {error}</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        {backgroundColor: showStudentCourses ? Colors.colorGreyNd : Colors.yellow}, // "Все курсы" is yellow when showStudentCourses is true, otherwise gray
                    ]}
                    onPress={loadAllCourses}
                >
                    <Text style={{fontSize: 18}}>Все курсы</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.button,
                        {backgroundColor: !showStudentCourses ? Colors.colorGreyNd : Colors.yellow}, // "Мои курсы" is yellow when showStudentCourses is false, otherwise gray
                    ]}
                    onPress={loadStudentCourses}
                >
                    <Text style={{fontSize: 18}}>Мои курсы</Text>
                </TouchableOpacity>
            </View>
            {loading ? <ActivityIndicator/> :
                <>
                    {
                        showStudentCourses ? <FlatList
                                data={filteredUserCourses}
                                keyExtractor={(item) => item.order.id.toString()}
                                renderItem={({item}) => {
                                    return (
                                        <UsersCoursesCard course={item}/>
                                    )
                                }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            dispatch(fetchStudentCourses());
                                        }}
                                    />
                                }
                            /> :
                            <FlatList
                                data={allCourses}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({item}) => {
                                    return (
                                        <AllCourseCard course={item}/>
                                    )
                                }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                    />
                                }
                            />
                    }
                </>}

            <Toast config={toastConfig}/>
        </View>
    );
};

interface CourseCardProps {
    course: any;
}

const AllCourseCard = ({course}: CourseCardProps) => {

    return (
        <>
            <Pressable onPress={() => {

            }} style={{flex: 1, marginBottom: 15}}>
                <LinearGradient colors={['#fff', '#f3efef', '#f0f9ff', '#e9f6ff']} style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {course.direction?.name ? course.direction?.name : course?.name}
                        </Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.oldPrice}>{course.start_price}</Text>
                        <Text style={styles.newPrice}>{course.old_price}</Text>
                    </View>
                </LinearGradient>
            </Pressable>

        </>

    );
};


interface UsersCoursesCardProps {
    course: StudentCourse;

}

const UsersCoursesCard = ({course}: UsersCoursesCardProps) => {
    const dispatch = useAppDispatch()
    const navigation = useNavigation();
    const settings = useAppSelector((state) => state.settings.data);

    const isFreeCourses = settings?.find(set => set.key === 'isFreeCourses')?.value

    //  const progress = Number(course.last_topic ?? 0) / 100;
    const date = new Date(course?.order?.next_payment_date)
    const privateType = !course?.order?.buy_months
    const freeType = !(course?.order?.buy_hours || course?.order?.buy_months)


    // const nextPaymentDate = course?.order?.next_payment_date
    //     ? `оплачен до ${course.order.next_payment_date}`
    //     : course?.order?.payment_amount
    //         ? `оплачено ${getHoursText(Number(course.order.payment_amount))}`
    //         : 'бесплатный';
    //
    // const getTextColor = (paymentAmount: string) => {
    //     const hours = Number(paymentAmount);
    //     return hours === 0 ? 'red' : 'black'; // Цвет текста в зависимости от количества часов
    // };

    return (
        <>
            {
                course.order.status_payment === 1 && (
                    <Pressable onPress={async () => {
                        if (course?.deny_access) {
                            Toast.show({
                                type: 'info',
                                text1: 'Ошибка',
                                text2: 'У Вас не оплачен курс. \n' +
                                    'Свяжитесь с тех. Поддержкой',
                                position: 'bottom',
                                bottomOffset: 50,
                            });
                            return
                        }
                        try {
                            const response = await dispatch(fetchDirectionPlan({
                                groupId: course.group?.id,
                                course_id: course.direction.id,
                            })).unwrap();

                            if (response.status !== "success") {
                                throw new Error("Не удалось загрузить курс");
                            }

                            const directions = response.data?.data || [];
                            // console.log('directions', directions)
                            dispatch(setGroupID(course.group?.id ? course.group?.id : course.direction.id));
                            dispatch(setType(course.group?.id ? 'group' : 'private'));
                            dispatch(setCourseID(course.direction.id));

                            if (directions.length === 1) {
                                const blockId = Number(directions[0].id);
                                dispatch(setBlockID(blockId));

                                try {
                                    const result = await dispatch(fetchBlockThemes({
                                        groupId: course.group?.id ?? undefined,
                                        blockId,
                                        type: course.group?.id ? 'group' : 'private',
                                    }));

                                    if (fetchBlockThemes.fulfilled.match(result)) {
                                        // @ts-ignore
                                        navigation.navigate(ROUTES.BLOCK_THEMES, {
                                            groupId: course.group?.id,
                                            blockId,
                                            type: course.group?.id ? 'group' : 'private'
                                        });
                                        return; // Прерываем выполнение, чтобы не было перехода на COURSE_DETAIL
                                    } else {
                                        throw new Error("Неизвестная ошибка при загрузке тем");
                                    }
                                } catch (error) {
                                    console.error("Ошибка при получении тем блока:", error);
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Ошибка!',
                                        text2: 'Не удалось загрузить темы блока',
                                        position: 'bottom',
                                        bottomOffset: 50,
                                    });
                                    return;
                                }
                            }
                        } catch (error) {
                            console.error("Ошибка при получении данных:", error);
                            Toast.show({
                                type: 'error',
                                text1: 'Ошибка!',
                                text2: 'Не удалось загрузить курс',
                                position: 'bottom',
                                bottomOffset: 50,
                            });
                            return;
                        }

                        // Если fetchBlockThemes не был вызван, выполняем стандартную навигацию
                        // @ts-ignore
                        navigation.navigate(ROUTES.COURSE_DETAIL);
                    }}
                               style={{flex: 1, marginBottom: 15}}>
                        <LinearGradient colors={['#fff', '#f3efef', '#f0f9ff', '#e9f6ff']} style={styles.card}>
                            <Text style={styles.time}>
                                {
                                    isFreeCourses === '0' && (
                                        freeType
                                            ? 'бесплатный'
                                            : (
                                                privateType
                                                    ? `оплачено ${course?.order?.buy_hours} ч`
                                                    : `${compareToday(date) > 0 ? "не оплачено с" : "оплачено до"} ${formateDate(date, 'DD.MM.YYYY')}`
                                            )
                                    )
                                }</Text>
                            <View style={styles.header}>
                                <Text style={styles.title}>{course.direction?.name}</Text>
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
                                    // @ts-ignore
                                     xmlns="http://www.w3.org/2000/svg">
                                    <Path d="M8.59 16.34L13.17 12 8.59 7.66L10 6.25L16 12.25L10 18.25L8.59 16.34Z"
                                          fill="#2B2D3E"/>
                                </Svg>
                            </View>
                        </LinearGradient>
                    </Pressable>
                )
            }
        </>

    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    button: {

        padding: 10,
        width: '48%',
        borderRadius: 10,
        alignItems: 'center'

    },
    courseItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    courseText: {
        fontSize: 16,
    },
    card: {
        flex: 1,
        borderRadius: 12,
        padding: 11,
        borderWidth: 1,
        borderColor: Colors.background,
        gap: 15,
        paddingBottom: 40
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2D3E',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 16,
        color: '#2B2D3E',
    },
    totalText: {
        fontSize: 16,
        color: '#2B2D3E',
        marginLeft: 5,
    },
    progressBarContainer: {
        width: '80%',
        height: 5,
        backgroundColor: '#d0e0ff',
        borderRadius: 5,
    },
    progressBar: {
        height: 5,
        backgroundColor: Colors.yellow,
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
    priceContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: 8,
    },
    oldPrice: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    newPrice: {
        fontSize: 16,
        color: '#2B2D3E',
        fontWeight: 'bold',
    },
});
