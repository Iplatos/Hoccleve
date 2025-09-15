import React, {useEffect} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {reportsOwnBacklog} from '../../redux/slises/reportsSlice.ts';
import {fetchHomeWork} from "../../redux/slises/homeWorkDetailSlice.ts";
import {ROUTES} from "../../constants/Routes.ts";
import {useNavigation} from "@react-navigation/native";
import {fetchControlWork} from "../../redux/slises/controlWorkSlice.ts";
import Toast from "react-native-toast-message";
import {Colors} from "../../constants/Colors.ts";

export const ReportsComponent = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const reportsState = useAppSelector((state) => state.reports);
    const settings = useAppSelector((state) => state.settings.data);
    const showHomeworkOnHomePage = settings?.find(el => el.key === 'showHomeworkOnHomePage')?.value === '1'
    const {courses} = useAppSelector(state => state.studentCourses);

    useEffect(() => {
     //   dispatch(reportsOwnBacklog());
    }, [dispatch]);


    if (reportsState.error) {
        return <Text>Error: {reportsState.error}</Text>;
    }

    if (!showHomeworkOnHomePage) {
        return null;
    }

    // Объединяем все данные в один массив
    const combinedData = [
        ...reportsState.class_works.data.map((item) => ({...item, type: 'class_works'})),
        ...reportsState.home_works.data.map((item) => ({...item, type: 'home_work'})),
        ...reportsState.control_works.data.map((item) => ({...item, type: 'control_work'})),
        ...reportsState.probe_works.data.map((item) => ({...item, type: 'probe_work'})),
    ];
    // Получение текущей даты
    const currentDate = new Date();


    // Разделение и сортировка
    const sortedData = combinedData.sort((a, b) => {
        // Проверяем, что deadline_date существует, иначе устанавливаем его на минимальное или максимальное значение
        const aDate = a.deadline_date ? new Date(a.deadline_date) : new Date(0); // Используем 1970-01-01 для null
        const bDate = b.deadline_date ? new Date(b.deadline_date) : new Date(0);

        const currentDate = new Date();

        const aOverdue = aDate < currentDate; // Проверка на просроченность
        const bOverdue = bDate < currentDate;

        if (aOverdue === bOverdue) {
            // Если оба элемента либо просроченные, либо непросроченные
            return aDate.getTime() - bDate.getTime(); // Сортировка по времени дедлайна
        }

        // Просроченные работы перемещаются вниз
        return aOverdue ? 1 : -1;
    });

    const renderReportItem = ({item}: any) => {
       // console.log('item', item)

        const activeCourse = courses?.filter(
            el => el.direction?.name === (item?.direction?.name ?? item?.work?.course?.direction?.name)
        );
        const today = new Date();
        let direction = '';
        let subDirection = ''
        let topic = '';
        let lesson = '';
        let statusText = 'Без срока';


        if (item.type === 'home_work' || item.type === 'class_works') {
            direction = item?.direction?.name || '';
            topic = item.lesson?.topic?.name || '';
            lesson = item.lesson?.name || '';
            const deadlineDate = item.deadline_date ? new Date(item.deadline_date) : null;
            if (deadlineDate && deadlineDate < today) {
                statusText = 'Просрочено';
            } else if (deadlineDate) {
                statusText = `Крайний срок: ${item.deadline_date}`;
            }
        } else if (item.type === 'control_work' || item.type === 'probe_work') {
            direction = item.theme?.course?.direction?.name || '';
            topic = item.theme?.name || '';
            lesson = item.work?.material?.name || '';
            const deadlineDate = item.deadline_date ? new Date(item.deadline_date) : null;
            if (deadlineDate && deadlineDate < today) {
                statusText = 'Просрочено';
            } else if (deadlineDate) {
                statusText = `Крайний срок: ${item.deadline_date}`;
            }
        }

        return (
            <TouchableOpacity onPress={() => {
                if (activeCourse.length > 0 && activeCourse[0].deny_access) {
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
                if (item.type === 'home_work' || item.type === 'class_works') {
                    const homeWorkCompleted = item.status === 0 ? 'notCompleted' : 'completed'
                    dispatch(fetchHomeWork(item.id));
                    // @ts-ignore
                    navigation.navigate(ROUTES.HOME_WORK, {isCompleted: homeWorkCompleted})
                } else if (item.type === 'probe_work') {
                    Toast.show({
                        type: 'info',
                        text1: 'В разработке',
                        text2: 'Функционал в разработке',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                    //  dispatch(fetchProbeWork(item.work.id));
                    //navigation.navigate(ROUTES.PROBE_WORK)
                } else if (item.type === 'control_work') {
                    dispatch(fetchControlWork(item.id));
                    // @ts-ignore
                    navigation.navigate(ROUTES.CONTROL_WORK)
                }

            }}>
                <View style={styles.reportItem}>
                    <View style={styles.reportInfo}>
                        <Text style={styles.subjectName}>{direction}</Text>
                        {topic && <Text style={styles.lessonName}>{topic}</Text>}
                        {lesson && <Text style={styles.lessonName}>{lesson}</Text>}
                    </View>

                    <Text
                        style={[
                            styles.status,
                            statusText.includes('Крайний срок') ? { color: Colors.colorAccent } : null
                        ]}
                    >
                        {statusText}
                    </Text>
                </View>
            </TouchableOpacity>

        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Домашнее задание</Text>
            {sortedData.length === 0
                ? <View><Text>Нет домашек</Text></View>
                : <FlatList
                    style={{height: 200}}
                    data={sortedData}
                    keyExtractor={(item) => `${item.type}-${item.id}`}
                    renderItem={renderReportItem}
                    persistentScrollbar
                    nestedScrollEnabled
                />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    reportItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 10,
    },
    reportInfo: {
        flex: 1,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    lessonName: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        fontSize: 14,
        color: 'red',
        textAlign: 'right',
        marginLeft: 10,
        width: '40%'
    },
});
