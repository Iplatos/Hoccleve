import {AnswerResponse} from "../redux/slises/answerSlice.ts";
import {Linking} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from "../context/AuthContext.tsx";

export const handleOpenFile = (path: string) => {
    Linking.openURL(`${axios.defaults.baseURL}/${path}`)
        .catch(err => console.error("Не удалось открыть файл:", err));
};

export const courseVisibility = {
    open: 1,
    restricted: 2,
    linear: 3,
};

export const extractTextFromJson = (jsonString: string): string => {
    try {
        const json = JSON.parse(jsonString);
        const content = json.content || [];
        return content.map((item: any) => item.content.map((subItem: any) => subItem.text).join('')).join('');
    } catch (error) {
        console.error('Failed to parse JSON', error);
        return '';
    }
};

export const getNoun = (
    number: number,
    one: string,
    two: string,
    five: string,
) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
};

export const getAgeTemplate = (birthday: any) => {
    const diff =
        (new Date().getTime() - new Date(birthday * 1000).getTime()) / 1000;
    const sm = {
        years: Math.floor(diff / (86400 * 365)),
        months: Math.floor(diff / (86400 * 30.4)),
        days: Math.floor(diff / 86400),
    };

    let ageTemplate = '';

    if (sm.years > 0) {
        ageTemplate += `${sm.years} ${getNoun(sm.years, 'год', 'года', 'лет')} `;
    }

    if (sm.months % 12 > 0) {
        ageTemplate += `${sm.months % 12} ${getNoun(
            sm.months % 12,
            'месяц',
            'месяца',
            'месяцев',
        )}`;
    }

    if (!sm.years && !sm.months && sm.days > 0) {
        ageTemplate += `${sm.days} ${getNoun(sm.days, 'день', 'дня', 'дней')}`;
    }

    return ageTemplate.trim();
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' });
    return formatter.format(date);
};
export const formatCreatedAtDate = (dateString: string) => {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];

    const date = new Date(dateString);

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0'); // Добавляем ведущий ноль
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Добавляем ведущий ноль

    return `Задано ${day} ${month} в ${hours}:${minutes}`;
};

export const formatCommentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const getHoursText = (hours: number) => {

    if (hours % 10 === 1 && hours % 100 !== 11) {
        return `${hours} час`;
    } else if ((hours % 10 >= 2 && hours % 10 <= 4) && !(hours % 100 >= 12 && hours % 100 <= 14)) {
        return `${hours} часа`;
    } else {
        return `${hours} часов`;
    }
};

// Функция для безопасного парсинга JSON
export const safeParse = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
};

export const isJson = (value: any): boolean => {
    if (typeof value !== 'string') return false;

    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null;
    } catch {
        return false;
    }
};

export const jsonConvert = (
    data: any,
    type: 'string' | 'object' = 'string'
): any => {
    if (!data) return type === 'string' ? '' : {};
    if (isJson(data)) return JSON.parse(data);
    if (typeof data === 'object' && type === 'string') return JSON.stringify(data);
    return data;
};

// функцию для вычисления текста результата
type CorrectAnswerScore = {
    score: number;
};

type Result = {
    [taskId: number]: AnswerResponse['data'] | null; // taskId должен быть числом
};

// принимает дату и отдает сколько дней прошло с текущего дня (0 сегодня, >=1  прошли, <=-1  ещё не наступили)
export const compareToday = (date: Date) =>
    Math.floor((new Date().getTime() - date.getTime()) / 1000 / 60 / 60 / 24);

export const formateDate = (date: Date, format = 'DD.MM.YYYY') => {
    const d = createDate({ date });

    return format
        .replace(/\bYYYY\b/, d.year.toString())
        .replace(/\bMM\b/, d.monthNumber.toString().padStart(2, '0'))
        .replace(/\bDD\b/, d.dayNumber.toString().padStart(2, '0'));
};

export const formatDateFromTheLine = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
};

function getResultText(result: Result, taskId: number, correctAnswerScore?: CorrectAnswerScore): string {
    let newText = result[taskId]?.message || ''; // Используем taskId как число

    if (!newText && correctAnswerScore) {

        switch (correctAnswerScore.score) {
            case 0:

                newText = 'Решено неверно';
                break;
            case 1:
                newText = 'Решено верно';
                break;
            case 4:
                newText = 'Решение принято';
                break;
            default:
                newText = '';
        }
    }

    return newText;
}

export default getResultText

export const getTextColor = (resultTitle?: string) => {
    switch (resultTitle) {
        case 'Решено неверно':
            return 'red';
        case 'Не верный ответ':
            return 'red';
        case 'Вы ответили не верно!':
            return 'red';
        case 'Решено верно':
            return 'green';
        case 'Вы ответили верно!':
            return 'green';
        case 'Решение принято':
            return 'blue';
        default:
            return 'black'; // Цвет по умолчанию
    }
};

const genitive = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
];

export const createDate = (params: any) => {
    const locale = params?.locale ?? 'default';

    const d = params?.date ?? new Date();
    const dayNumber = d.getDate();
    const day = d.toLocaleDateString(locale, { weekday: 'long' });
    const dayNumberInWeek = d.getDay() + 1;
    const dayShort = d.toLocaleDateString(locale, { weekday: 'short' });
    const year = d.getFullYear();
    const yearShort = d.toLocaleDateString(locale, { year: '2-digit' });
    const month = d.toLocaleDateString(locale, { month: 'long' });
    const monthShort = d.toLocaleDateString(locale, { month: 'short' });
    const monthNumber = d.getMonth() + 1;
    const monthIndex = d.getMonth();
    const monthGenitive = genitive[monthIndex];
    const timestamp = d.getTime();
    const week = getWeekNumber(d);

    return {
        date: d,
        dayNumber,
        day,
        dayNumberInWeek,
        dayShort,
        year,
        yearShort,
        month,
        monthGenitive,
        monthShort,
        monthNumber,
        monthIndex,
        timestamp,
        week,
    };
};

export const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysYear + firstDayOfYear.getDay() + 1) / 7);
};

export const calculateTimeSpent = (left_time: number) => {
    const totalTime = 4 * 60 * 60; // 4 часа в секундах (14400 секунд)

    const timeSpent = totalTime - left_time; // Фактическое затраченное время

    if (left_time >= 0) {
        return formatTime(timeSpent)
     //   console.log(`Контрольная сдана за ${formatTime(timeSpent)} (меньше 4 часов)`);
    } else {
        return formatTime(timeSpent)
      //  console.log(`Контрольная сдана за ${formatTime(timeSpent)} (дольше 4 часов)`);
    }
};

export const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${secs}`;
};

// ПОЛУЧЕНИЕ АКТУАЛЬННОГО URL
export const getUrl = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(API_URL);
    } catch (error) {
        console.error('Error fetching URL:', error);
        return null;
    }
};