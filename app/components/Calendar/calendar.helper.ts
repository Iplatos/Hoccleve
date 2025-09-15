
// Расширяем тип AgendaEntry, добавляя новые свойства
import {AgendaEntry} from "react-native-calendars";

export interface ExtendedAgendaEntry extends AgendaEntry {
    speakerName?: string;
    startTime?: string;
    endTime: string;
    location: string;
    group: string
}

// Обновляем тип AgendaSchedule для использования ExtendedAgendaEntry
export interface ExtendedAgendaSchedule {
    [date: string]: ExtendedAgendaEntry[];
}
