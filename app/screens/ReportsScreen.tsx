import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Button} from 'react-native';
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchReports, setTab} from "../redux/slises/reportsSlice.ts";
import {Colors} from "../constants/Colors.ts";
import {GlobalStyle} from "../constants/GlobalStyle.ts";
import {RNCheckbox} from "../components/RNCheckbox/RNCheckbox.tsx";
import {PeriodDatePicker} from "../components/PeriodDatePicker/PeriodDatePicker.tsx";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {initialDate} from "../settings/Settings.ts";
import {Picker} from "@react-native-picker/picker";
import {formatMonthYear, MonthYearPicker} from "../components/MonthYearPicker/MonthYearPicker.tsx";

const TABS = [
    {key: 'private', label: 'Частники'},
    {key: 'group', label: 'Групповой'},
];

export const ReportsScreen = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);
    const {data, loading, tab} = useAppSelector((state) => state.reports);

    const [pickerVisible, setPickerVisible] = useState(false);
    const [isPeriod, setIsPeriod] = useState(false);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    // Запрашивать отчёты при изменении таба
    useEffect(() => {
        if (tab === 'private') {
            // const from = new Date(year, month, 1);
            dispatch(fetchReports({from: initialDate}));
        } else if (tab === 'group') {
            // const from = new Date(); // по умолчанию текущая дата
            dispatch(fetchReports({from: initialDate}));
        }
    }, [tab]);


    // Обработка выбора месяца и года
    const handleSelectMonthYear = (m: number, y: number) => {
        setMonth(m);
        setYear(y);
        const from = new Date(y, m, 1);
        const up = new Date(y, m + 1, 0); // последний день месяца
        dispatch(fetchReports({
            from: formatDateToString(from),
            up: formatDateToString(up)
        }));
        setPickerVisible(false);
    };

    // Обработка выбора периода
    const handlePeriodChange = (from: Date | null, to: Date | null) => {
        if (from) setFromDate(from);
        else setFromDate(null);

        if (to) setToDate(to);
        else setToDate(null);

        if (from && to) {
            dispatch(fetchReports({
                from: formatDateToString(from),
                up: formatDateToString(to)
            }));
        } else {
            // Можно либо не вызывать dispatch, либо вызвать с пустыми значениями
            // Например:
            dispatch(fetchReports({
                from: from ? formatDateToString(from) : '',
                up: to ? formatDateToString(to) : ''
            }));
        }
    };

    // Отфильтрованные данные по текущему пользователю
    const filteredReports = data?.seminarians.find(
        (el) => el.teacher.id === user?.id
    );

    // Рендер табов
    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {TABS.map((t) => (
                <TouchableOpacity
                    key={t.key}
                    onPress={() => dispatch(setTab(t.key))}
                    style={[
                        styles.tabButton,
                        {backgroundColor: tab === t.key ? '#f1e6f6' : '#e1e1e1'},
                    ]}
                >
                    <Text style={styles.tabText}>{t.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Рендер отчёта
    const renderReport = () => {
        if (loading) return <ActivityIndicator/>;
        if (!filteredReports || !filteredReports.teacher) {
            return <Text style={styles.emptyText}>Нет данных</Text>;
        }

        return (
            <View style={styles.reportCard}>
                <Text style={styles.name}>{filteredReports.teacher.name}</Text>
                <Text style={styles.info}>Часы: {filteredReports.total_hours}</Text>
                <Text style={styles.info}>Пропуски: {filteredReports.pass}</Text>
                <Text style={styles.info}>Группы: {filteredReports.privateStudents}</Text>
                <Text style={styles.salary}>ЗП: {filteredReports.salary}₽</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[GlobalStyle.titleGL, styles.title]}>Моя ЗП</Text>

            {renderTabs()}

            {tab === 'private' && (
                <>
                    <TouchableOpacity
                        style={[styles.commentInput, {width: '40%', alignItems: 'center'}]}
                        onPress={() => setPickerVisible(true)}>
                        <Text style={styles.selectedText}>{formatMonthYear(month, year)}</Text>
                    </TouchableOpacity>
                    <MonthYearPicker
                        visible={pickerVisible}
                        onClose={() => setPickerVisible(false)}
                        onSelect={handleSelectMonthYear}
                        initialMonth={month}
                        initialYear={year}
                    />
                </>
            )}

            {tab === 'group' && (
                <>
                    <TouchableOpacity
                        onPress={() => setIsPeriod((prev) => !prev)}
                        style={styles.groupContainer}
                    >
                        {!isPeriod &&
                            <>
                                <TouchableOpacity style={styles.commentInput} onPress={() => setPickerVisible(true)}>
                                    <Text style={styles.selectedText}>{formatMonthYear(month, year)}</Text>
                                </TouchableOpacity>
                                <MonthYearPicker
                                    visible={pickerVisible}
                                    onClose={() => setPickerVisible(false)}
                                    onSelect={handleSelectMonthYear}
                                    initialMonth={month}
                                    initialYear={year}
                                />
                            </>
                        }
                        {isPeriod && (
                            <PeriodDatePicker
                                fromDate={fromDate}
                                toDate={toDate}
                                onChange={handlePeriodChange}
                            />
                        )}
                        <View>
                            <RNCheckbox
                                checkboxStyle={{width: 20, height: 20}}
                                isChecked={isPeriod}
                                onPress={() => setIsPeriod((prev) => !prev)}
                            />
                        </View>
                        <Text style={{marginLeft: 8}}>Выбрать период</Text>
                    </TouchableOpacity>
                </>
            )}

            {renderReport()}
        </View>
    );
};

const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // добавляет 0
    const day = String(date.getDate()).padStart(2, '0');        // добавляет 0
    return `${year}-${month}-${day}`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    commentInput: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f1e6f6',
        borderRadius: 8,
        // borderWidth: 1,
        // borderColor: '#dddce3',
        // borderRadius: 8,
        // padding: 10,
        marginRight: 10,
        alignItems: 'flex-start',
        //  justifyContent: 'center',
        //  textAlignVertical: 'top',
        //  marginBottom: 12,
        //  color: '#000',
    },
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    title: {
        textAlign: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        padding: 12,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    tabText: {
        color: '#000',
        fontSize: 16,
        textAlign: 'center',
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
      //  marginHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    info: {
        fontSize: 15,
        marginBottom: 4,
        color: '#000',
    },
    salary: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginTop: 8,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: Colors.colorBlack,
    },
    selectedText: {
        // marginTop: 8,
        fontSize: 16,
    },
});