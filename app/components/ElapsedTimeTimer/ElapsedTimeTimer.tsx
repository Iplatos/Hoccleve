import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {Colors} from "../../constants/Colors.ts";

dayjs.extend(duration);

interface Props {
    startTime: string; // Пример: "2025-05-15 23:00:34"
}

export const ElapsedTimeTimer: React.FC<Props> = ({ startTime }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const start = dayjs(startTime?.replace(' ', 'T')); // преобразуем к ISO
        const updateTimer = () => {
            const now = dayjs();
            const diff = now.diff(start, 'second');
            const formatted = formatDuration(diff);
            setElapsed(formatted);
        };

        updateTimer(); // инициализация
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatDuration = (totalSeconds: number) => {
        const d = dayjs.duration(totalSeconds * 1000);
        const hours = String(d.hours()).padStart(2, '0');
        const minutes = String(d.minutes()).padStart(2, '0');
        const seconds = String(d.seconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    if (!startTime) return

    return (
        <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.colorAccentRGB }}>
               {elapsed}
            </Text>
        </View>
    );
};

