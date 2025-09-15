import React, {useEffect, useState} from 'react';
import {Dimensions, View} from "react-native";
import {Colors} from "../constants/Colors.ts";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import ExpandableCalendarScreen from "../components/ExpandableCalendarScreen/ExpandableCalendarScreen.tsx";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {Calendar} from "react-native-calendars";
import {fetchCalendar} from "../redux/slises/calendarSlice.ts";
import {initialDate} from "../settings/Settings.ts";

export const CalendarScreen = () => {
    const dispatch = useAppDispatch();
    console.log('CalendarScreen')
    const status = useAppSelector(state => state.calendar.status);
    const settings = useAppSelector((state) => state.settings.data);

    const isHideScheduleStudent =
        (settings?.find(el => el.key === 'isHideScheduleStudent')?.value ?? '0') === '1';


    return (
        <View style={{
            flex: 1,
            backgroundColor: Colors.white,
        }}>
            {
                !isHideScheduleStudent &&
                <ExpandableCalendarScreen />
            }
            <Toast config={toastConfig} />
        </View>
    );
};

