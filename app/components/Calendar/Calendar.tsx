// import React, {memo, useEffect, useState} from 'react';
// import {Agenda, AgendaEntry, DateData, LocaleConfig} from "react-native-calendars";
// import {ActivityIndicator, Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View} from "react-native";
//
// import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
//
// import {ExtendedAgendaSchedule} from "./calendar.helper.ts";
// import {fetchCalendar, TimetableEvent} from "../../redux/slises/calendarSlice.ts";
// import {Colors} from "../../constants/Colors.ts";
// import {GlobalStyle} from "../../constants/GlobalStyle.ts";
// import {RFValue} from "react-native-responsive-fontsize";
// import {initialDate} from "../../settings/Settings.ts";
//
// // Настройка локализации
//
// LocaleConfig.locales['ru'] = {
//     monthNames: [
//         'Январь',
//         'Февраль',
//         'Март',
//         'Апрель',
//         'Май',
//         'Июнь',
//         'Июль',
//         'Август',
//         'Сентябрь',
//         'Октябрь',
//         'Ноябрь',
//         'Декабрь',
//     ],
//     monthNamesShort: [
//         'Янв',
//         'Фев',
//         'Мар',
//         'Апр',
//         'Май',
//         'Июн',
//         'Июл',
//         'Авг',
//         'Сен',
//         'Окт',
//         'Ноя',
//         'Дек',
//     ],
//     dayNames: [
//         'воскресенье',
//         'понедельник',
//         'вторник',
//         'среда',
//         'четверг',
//         'пятница',
//         'суббота',
//     ],
//     dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
//     today: 'Сегодня',
// };
// LocaleConfig.defaultLocale = 'ru';
//
// const {width, height} = Dimensions.get('window');
//
// const RenderItem = memo(({reservation, isFirst}) => {
//     const fontSize = isFirst ? 16 : 14;
//     const color = isFirst ? 'black' : '#43515c';
//
//     const handlePress = (link: string) => {
//         if (link) {
//             Linking.openURL(link).catch(err =>
//                 Alert.alert('Ошибка', `Не удалось открыть ссылку. Адрес ссылки: ${link} `)
//             );
//         } else {
//             Alert.alert(link);
//         }
//     };
//
//     return (
//         <View style={styles.card}>
//             <View style={styles.timeContainer}>
//                 <Text
//                     style={styles.timeText}>{reservation.startTime.slice(0, 5)} - {reservation.endTime.slice(0, 5)}</Text>
//             </View>
//             <View style={styles.modeContainer}>
//                 <Text style={styles.modeText}>online</Text>
//             </View>
//             <View style={styles.groupContainer}>
//                 <Text style={styles.groupLabel}>Группа</Text>
//                 <Text style={styles.groupText}>{reservation.group}</Text>
//             </View>
//             <View style={styles.subjectContainer}>
//                 <Text style={styles.subjectText}>{reservation.name}</Text>
//             </View>
//             <TouchableOpacity style={styles.btn} onPress={() => handlePress(reservation.location)}><Text
//                 style={styles.btnText}>Ссылка на занятие</Text></TouchableOpacity>
//         </View>
//     );
// }, (prevProps, nextProps) => {
//     return prevProps.reservation.name === nextProps.reservation.name && prevProps.reservation.height === nextProps.reservation.height;
// });
//
// export const AgendaScreen = () => {
//     const dispatch = useAppDispatch();
//     const timetable = useAppSelector(state => state.calendar.data);
//     const status = useAppSelector(state => state.calendar.status);
//
//
//     const timetableStatus = useAppSelector(state => state.calendar.status);
//     const timetableError = useAppSelector(state => state.calendar.error);
//    // console.log('timetable', timetable)
//     const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
//
//     // const now = new Date();
//     // const year = now.getFullYear();
//     // const month = String(now.getMonth() + 1).padStart(2, '0');
//     // const initialDate = `${year}-${month}-01`;
//
//     useEffect(() => {
//         dispatch(fetchCalendar(initialDate));
//         setLoadedMonths(prev => new Set(prev).add(initialDate));
//     }, []);
//
//     const convertTimetableToAgendaItems = (events: TimetableEvent[]): ExtendedAgendaSchedule => {
//         const items: ExtendedAgendaSchedule = {};
//         const currentDate = new Date();
//
//         const startDate = new Date(currentDate);
//         startDate.setMonth(currentDate.getMonth() - 1);
//         startDate.setDate(1);
//
//         const endDate = new Date(currentDate);
//         endDate.setMonth(currentDate.getMonth() + 1);
//         endDate.setDate(0);
//
//         const formatDate = (date: Date): string => {
//             return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
//         };
//
//         events.forEach(event => {
//             const date = new Date(event.date_conference);
//             const formattedDate = formatDate(date); // Используем локальную дату
//
//             if (!items[formattedDate]) {
//                 items[formattedDate] = [];
//             }
//
//             items[formattedDate].push({
//                 name: event.direction?.name || 'Нет названия',
//                 height: 100,
//                 day: formattedDate,
//                 startTime: event?.start_time || 'Время начала не указано',
//                 endTime: event?.end_time || 'Время окончания не указано',
//                 location: event?.link_to_meeting || 'Место не указано',
//                 group: event?.group?.name || 'Группа не указана'
//             });
//
//             if (event.interval_type === 'regular' && event.repeat_day) {
//                 const repeatDayOfWeek = (event.repeat_day) % 7;
//
//                 let repeatDate = new Date(date);
//                 const firstDayOfWeek = (7 + repeatDayOfWeek - repeatDate.getDay()) % 7;
//                 repeatDate.setDate(repeatDate.getDate() + firstDayOfWeek);
//
//                 while (repeatDate <= endDate) {
//                     const repeatFormattedDate = formatDate(repeatDate);
//                     if (!items[repeatFormattedDate]) {
//                         items[repeatFormattedDate] = [];
//                     }
//
//                     items[repeatFormattedDate].push({
//                         name: event.direction?.name || 'Нет названия',
//                         height: 100,
//                         day: repeatFormattedDate,
//                         startTime: event?.start_time || 'Время начала не указано',
//                         endTime: event?.end_time || 'Время окончания не указано',
//                         location: event?.link_to_meeting || 'Место не указано',
//                         group: event?.group?.name || 'Группа не указана'
//                     });
//
//                     repeatDate.setDate(repeatDate.getDate() + 7);
//                 }
//
//                 repeatDate = new Date(date);
//                 const lastDayOfWeek = (7 + repeatDate.getDay() - repeatDayOfWeek) % 7;
//                 repeatDate.setDate(repeatDate.getDate() - lastDayOfWeek);
//
//                 while (repeatDate >= startDate) {
//                     const repeatFormattedDate = formatDate(repeatDate);
//                     if (!items[repeatFormattedDate]) {
//                         items[repeatFormattedDate] = [];
//                     }
//
//                     items[repeatFormattedDate].push({
//                         name: event.direction?.name || 'Нет названия',
//                         height: 100,
//                         day: repeatFormattedDate,
//                         startTime: event?.start_time || 'Время начала не указано',
//                         endTime: event?.end_time || 'Время окончания не указано',
//                         location: event?.link_to_meeting || 'Место не указано',
//                         group: event?.group?.name || 'Группа не указана'
//                     });
//
//                     repeatDate.setDate(repeatDate.getDate() - 7);
//                 }
//             }
//         });
//
//         return items;
//     };
//
//     const items = convertTimetableToAgendaItems(timetable);
//     // console.log(items)
//
//     const loadItemsForMonth = (month: DateData) => {
//         const monthKey = `${month.year}-${String(month.month).padStart(2, '0')}-01`;
//         if (!loadedMonths.has(monthKey)) {
//             dispatch(fetchCalendar(month.dateString));
//             setLoadedMonths(prev => new Set(prev).add(monthKey));
//         } else {
//             console.log('Данные для этого месяца уже загружены:', monthKey);
//         }
//     };
//
//     const renderEmptyDate = () => (
//         <View style={styles.emptyDate}>
//             <Text>Нет занятий</Text>
//         </View>
//     );
//
//     const renderEmptyData = () => (
//         <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//             <View><Text>Нет занятий</Text></View>
//         </View>
//     );
//
//     const rowHasChanged = (r1: AgendaEntry, r2: AgendaEntry) => r1.name !== r2.name;
//
//     // if (timetableStatus === 'loading') {
//     //     return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
//     // }
//
//
//     return (
//         <View style={{flex: 1}}>
//             <Text style={[GlobalStyle.titleGL, {paddingHorizontal: 15}]}>Расписание</Text>
//             <Agenda
//                 firstDay={1}
//                 style={{
//                     height: height
//                 }}
//                 items={items}
//                 //  loadItemsForMonth={loadItemsForMonth}
//                 renderItem={(reservation, isFirst) => <RenderItem reservation={reservation} isFirst={isFirst}/>}
//                 //   renderEmptyDate={renderEmptyDate}
//                 renderEmptyData={renderEmptyData}
//                 rowHasChanged={rowHasChanged}
//                 pastScrollRange={6}
//                 futureScrollRange={6}
//                 showOnlySelectedDayItems={true}
//                 scrollEnabled={false}
//                 showClosingKnob={true}
//
//                 theme={{
//                     selectedDayBackgroundColor: Colors.colorAccent,
//                     dotColor: Colors.colorAccent,
//                 }}
//             />
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     item: {
//         backgroundColor: 'white',
//         flex: 1,
//         borderRadius: 5,
//         padding: 10,
//         marginRight: 10,
//         marginTop: 17
//     },
//     emptyDate: {
//         height: 15,
//         flex: 1,
//         paddingTop: 30
//     },
//     customDay: {
//         margin: 10,
//         fontSize: 24,
//         color: 'green'
//     },
//     dayItem: {
//         marginLeft: 34
//     },
//
//     card: {
//         flexDirection: 'column',
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#0000ff',
//         padding: 10,
//         margin: 10,
//         backgroundColor: '#f8f9fe'
//     },
//     timeContainer: {
//         marginBottom: 5
//     },
//     timeText: {
//         fontSize: RFValue(12, 680),
//         // fontWeight: 'bold'
//     },
//     modeContainer: {
//         marginBottom: 5
//     },
//     modeText: {
//         fontSize: 14,
//         color: 'grey'
//     },
//     groupContainer: {
//         marginBottom: 5
//     },
//     groupLabel: {
//         fontSize: RFValue(10, 680),
//         color: 'grey'
//     },
//     groupText: {
//         fontSize: RFValue(13, 680),
//         fontWeight: 'bold'
//     },
//     subjectContainer: {
//         marginTop: 5
//     },
//     subjectText: {
//         fontSize: RFValue(14, 680),
//         fontWeight: 'bold'
//     },
//     btn: {},
//     btnText: {
//         fontSize: RFValue(13, 680),
//     }
// });
