import React, {useRef, useState} from 'react';
import {
    ActivityIndicator,
    AppState,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import {useNavigation, useRoute} from "@react-navigation/native";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {CourseDetailCard} from "../components/CourseDetailCard/CourseDetailCard.tsx";
import {Colors} from "../constants/Colors.ts";
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import LottieView from "lottie-react-native";
import {DirectionItem, fetchDirectionPlan, fetchDirectionPlanBySeminarian} from "../redux/slises/directionPlanSlice.ts";
import {hasRole} from "../settings/helpers.tsx";
import {CourseDetailCardBySeminarian} from "../components/CourseDetailCard/CourseDetailCardBySeminarian.tsx";


export const CourseDetailScreen: React.FC<{ route: any }> = () => {
    console.log('CourseDetailScreen')
    const route = useRoute();
    const dispatch = useAppDispatch();

    // ДЛЯ ПРЕПОДА
    const courseId = (route.params as { courseId?: number })?.courseId; // безопасно достаем

    const [refreshing, setRefreshing] = useState(false);
    const {groupID, course_id: courseID} = useAppSelector(state => state.studentCourses);
    const directionPlans = useAppSelector(state => state.directionPlan.data)

    // const data = useAppSelector(state => state.directionPlan?.data?.[0] ?? null);
    const {status, error} = useAppSelector(state => state.directionPlan);
    const animation = useRef<LottieView>(null);

    const user = useAppSelector(state => state.user.user);

    const isSeminarian = user ? hasRole(user, "seminarian") : false;
    const isStudent = !isSeminarian;

    // Функция для обновления данных
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (isSeminarian && courseId) {
                await dispatch(fetchDirectionPlanBySeminarian(courseId)).unwrap();
            } else {
                const groupId = groupID;
                const course_id = courseID;
                await dispatch(fetchDirectionPlan({groupId, course_id})).unwrap();
            }
        } catch (err) {
            console.error('Error during refresh:', err);
        } finally {
            setRefreshing(false);
        }
    };

    if (status === 'loading' && !refreshing) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <LottieView
                    autoPlay
                    ref={animation}
                    speed={0.5}
                    style={{
                        width: 200,
                        height: 200,
                    }}
                    source={require('../../app/assets/loader.json')}
                />
            </View>
        );
    }

    const renderItem = ({item, index}: { item: DirectionItem, index: number }) => {
        if (isSeminarian) {
            return <CourseDetailCardBySeminarian courseDetail={item} index={index}/>
        } else {
            return <CourseDetailCard courseDetail={item} index={index}/>
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CoursesHeader title={directionPlans?.course_name}/>
            <FlatList
                data={directionPlans?.data}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#9Bd35A', '#689F38']}
                    />
                }
            />
            <Toast config={toastConfig}/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //  paddingHorizontal: 15,
        justifyContent: 'center',
        backgroundColor: Colors.white
    },
});

