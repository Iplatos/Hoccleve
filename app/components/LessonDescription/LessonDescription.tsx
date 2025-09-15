import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type LessonDescriptionProps = {
    description: string
}

// Функция для извлечения текста из JSON строки
export const extractTextFromDescription = (jsonString: string): string => {
    try {
        // Попытка распарсить JSON-строку в объект
        const description: { type: string; content: any[] } = JSON.parse(jsonString);

        // Функция для рекурсивного извлечения текста
        const extractText = (content: any[]): string => {
            if (Array.isArray(content)) {
                return content
                    .map(item => {
                        if (item.type === 'paragraph' && Array.isArray(item.content)) {
                            return item.content
                                .map((textItem: { type: string; text?: string }) => textItem.text || '')
                                .join(' ');
                        }
                        return extractText(item.content);
                    })
                    .join('\n\n');
            }
            return '';
        };

        return extractText(description.content);
    } catch (error) {
        console.error("Ошибка парсинга JSON:", error);
        return ""; // Возвращаем пустую строку, если парсинг не удался
    }
};

export const LessonDescription = ({ description }: LessonDescriptionProps) => {

    return (
        <>
            {description.length > 0 && (
                <View style={styles.container}>
                    <Text style={styles.text}>{extractTextFromDescription(description)}</Text>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e7e7e8',
        borderRadius: 8,
        padding: 15,
    },
    text: {
        fontSize: 16,
    },
});
