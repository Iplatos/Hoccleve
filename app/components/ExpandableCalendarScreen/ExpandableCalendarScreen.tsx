import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {fetchCalendar, TimetableEvent} from "../../redux/slises/calendarSlice.ts";
import {Colors} from "../../constants/Colors.ts";
import AgendaItem from "./mocks/AgendaItem.tsx";
import {MarkedDates} from "react-native-calendars/src/types";
import moment from "moment";
import {day, month, year} from "../../settings/Settings.ts";
import {ExpandableCalendar} from "react-native-calendars/src";
import {AgendaList, CalendarProvider, LocaleConfig, WeekCalendar} from "react-native-calendars";
import {hasRole} from "../../settings/helpers.tsx";

LocaleConfig.locales['ru'] = {
    monthNames: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ],
    monthNamesShort: [
        'Янв',
        'Фев',
        'Мар',
        'Апр',
        'Май',
        'Июн',
        'Июл',
        'Авг',
        'Сен',
        'Окт',
        'Ноя',
        'Дек',
    ],
    dayNames: [
        'воскресенье',
        'понедельник',
        'вторник',
        'среда',
        'четверг',
        'пятница',
        'суббота',
    ],
    dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    today: 'Сегодня',
};
LocaleConfig.defaultLocale = 'ru';

const leftArrowIcon = require('../ExpandableCalendarScreen/img/previous.png');
const rightArrowIcon = require('../ExpandableCalendarScreen/img/next.png');


type AgendaItem = {
    title: string; // Дата
    data: TimetableEvent[];
};

interface Props {
    weekView?: boolean;
}

// Вспомогательная функция для генерации markedDates
const generateMarkedDates = (agendaItems: AgendaItem[]): MarkedDates => {
    const marked: MarkedDates = {};

    agendaItems.forEach(({title, data}) => {
        marked[title] = data.length > 0 ? {marked: true} : {disabled: true};
    });

    return marked;
};

// Хук для управления отмеченными датами
const useMarkedDates = (agendaItems: AgendaItem[]) => {
    return useMemo(() => {
        if (agendaItems.length > 0) {
            return generateMarkedDates(agendaItems);
        }
        return {};
    }, [agendaItems]);
};

const ExpandableCalendarScreen = (props: Props) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user.user);
    const timetable = useAppSelector(state => state.calendar.data);
    const isLoading = useAppSelector(state => state.calendar.status === 'loading');
    const isSeminarian = user ? hasRole(user, "seminarian") : false;
    const [refreshing, setRefreshing] = useState(false);
    const [weekView, setWeekView] = useState(false);

    const agendaItems = useMemo(() => transformToAgendaItems(timetable), [timetable]);
    const markedDates = useMarkedDates(agendaItems);
    const initialDateCalendar = `${year}-${month}-${day}`;

    const [selectedDate, setSelectedDate] = useState<string>(initialDateCalendar);

    // 🔹 функция запроса календаря на месяц
    const loadMonth = useCallback((dateString: string) => {
        const start = moment(dateString).startOf("month").format("YYYY-MM-DD");
        const end = moment(dateString).endOf("month").format("YYYY-MM-DD");

        dispatch(fetchCalendar({
            start,
            end,
            type: "my",
            filters: {
                seminarians: isSeminarian ? [user?.id] : [],
                childrens: [],
                groupsAndClasses: [],
                direction: null,
                seminariansInCourses: [],
            }
        }));
    }, [dispatch, user]);

    // 🔹 первый запрос (при открытии экрана)
    // useEffect(() => {
    //     loadMonth(initialDateCalendar);
    // }, [loadMonth]);

    // 🔹 обработчик рефреша
    const onRefresh = useCallback(() => {
        setRefreshing(true);
          loadMonth(selectedDate);
        setRefreshing(false);
    }, [
          loadMonth,
        selectedDate]);

    // 🔹 фильтрация событий по выбранной дате
    const filteredAgendaItems = useMemo(() => {
        if (!agendaItems || agendaItems.length === 0) return [];
        const filtered = agendaItems.filter(item => item.title === selectedDate);
        return filtered.length > 0 ? filtered : [{title: selectedDate, data: []}];
    }, [agendaItems, selectedDate]);

    const renderItem = useCallback(({item}: any) => {
        return <AgendaItem item={item} isSeminarian={isSeminarian}/>;
    }, []);

    console.log(agendaItems)
    return (
        <CalendarProvider
            date={initialDateCalendar}
            showTodayButton
            todayButtonStyle={{alignSelf: 'flex-start', marginRight: 5, right: 0}}
            onDateChanged={(date) => setSelectedDate(date)}
        >
            {weekView ? (
                <WeekCalendar
                    firstDay={1}
                    markedDates={{
                        ...markedDates,
                        [selectedDate]: {selected: true, selectedColor: Colors.colorAccent},
                    }}
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                />
            ) : (
                <ExpandableCalendar
                    firstDay={1}
                    markedDates={{
                        ...markedDates,
                        [selectedDate]: {selected: true, selectedColor: Colors.colorAccent},
                    }}
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                      onMonthChange={(month) => loadMonth(month.dateString)} // 🔹 подгрузка при смене месяца
                    leftArrowImageSource={leftArrowIcon}
                    rightArrowImageSource={rightArrowIcon}
                    closeOnDayPress={false}
                />
            )}
            {isLoading ? (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator/>
                </View>
            ) : (
                <AgendaList
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    sections={filteredAgendaItems}
                    renderItem={renderItem}
                    sectionStyle={styles.section}
                    keyExtractor={(item, index) => `${item?.id || 'no-id'}-${index}`}
                    ListEmptyComponent={
                        <Text style={{paddingLeft: 15, marginTop: 15, fontSize: 18}}>
                            Нет занятий
                        </Text>
                    }
                />
            )}
        </CalendarProvider>
    );
};

export function transformToAgendaItems(data: any[]): AgendaItem[] {
    if (!Array.isArray(data)) return [];

    const groupedByDate: Record<string, any[]> = data.reduce((acc, item) => {
        const date = item.date_conference;
        if (!date) return acc;
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    return Object.entries(groupedByDate)
        .map(([date, items]) => ({
            title: date,
            data: items.sort((a, b) => moment(a.start_time, "HH:mm").diff(moment(b.start_time, "HH:mm"))),
        }))
        .sort((a, b) => moment(a.title).diff(moment(b.title)));
}


// export function transformToAgendaItems(data: any[]): AgendaItem[] {
//     if (!Array.isArray(data)) {
//         throw new Error("Input data must be an array");
//     }
//
//     const MAX_MONTHS_AHEAD = 2; // На сколько месяцев вперед создавать занятия
//     const today = moment();
//
//     // Генерация будущих занятий
//     const generateFutureLessons = (item: any): any[] => {
//         if (item.interval_type !== "regular") {
//             return [];
//         }
//
//         const futureLessons: any[] = [];
//         const repeatDay = item.repeat_day; // 1 (понедельник) – 7 (воскресенье)
//         const today = moment();
//         const maxDate = item.end_date
//             ? moment(item.end_date, "YYYY-MM-DD")
//             : today.clone().add(MAX_MONTHS_AHEAD, "months");
//
//         const startDate = moment(item.start_date || item.date_conference, "YYYY-MM-DD");
//         let nextDate = startDate.clone();
//
//         // Найдём первую дату с нужным днём недели >= startDate
//         while (nextDate.isoWeekday() !== repeatDay || nextDate.isBefore(startDate, "day")) {
//             nextDate.add(1, "day");
//         }
//
//         while (nextDate.isSameOrBefore(maxDate, "day")) {
//             futureLessons.push({
//                 ...item,
//                 date_conference: nextDate.format("YYYY-MM-DD"),
//             });
//             nextDate = nextDate.add(1, "week");
//         }
//
//         return futureLessons;
//     };
//
//     // Создаем расширенный список с будущими занятиями
//     const extendedData = data.flatMap((item) => {
//         const futureLessons = generateFutureLessons(item); // Создаем занятия для регулярных событий
//         return [item, ...futureLessons]; // Объединяем оригинальные и созданные события
//     });
//
//     // Группировка по дате
//     const groupedByDate: Record<string, any[]> = extendedData.reduce((acc, item) => {
//         const date = item.date_conference; // Используем date_conference как ключ
//         if (!date) {
//             console.warn("Item without date_conference:", item);
//             return acc;
//         }
//         if (!acc[date]) {
//             acc[date] = [];
//         }
//         acc[date].push(item);
//         return acc;
//     }, {});
//
//     // Преобразование в формат AgendaItem
//     return Object.entries(groupedByDate)
//         .map(([date, items]) => ({
//             title: date, // Заголовок — дата
//             data: items.sort((a, b) => {
//                 const timeA = moment(a.start_time, "HH:mm:ss"); // Сортировка по start_time
//                 const timeB = moment(b.start_time, "HH:mm:ss");
//                 return timeA.isBefore(timeB) ? -1 : 1;
//             }),
//         }))
//         .sort((a, b) => {
//             // Сортировка по дате заголовков
//             return moment(a.title, "YYYY-MM-DD").isBefore(moment(b.title, "YYYY-MM-DD")) ? -1 : 1;
//         });
// }

export default ExpandableCalendarScreen;

const styles = StyleSheet.create({
    calendar: {
        paddingLeft: 20,
        paddingRight: 20
    },
    header: {
        backgroundColor: 'lightgrey'
    },
    section: {
        backgroundColor: '#f0f4f7',
        color: 'grey',
        textTransform: 'capitalize',
    }
});

