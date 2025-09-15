import React from "react";
import {useAppDispatch} from "../../redux/hooks.ts";
import {useNavigation} from "@react-navigation/native";
import {BlockTheme} from "../../redux/slises/blockThemesSlice.ts";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import {Colors} from "../../constants/Colors.ts";
import {RFValue} from "react-native-responsive-fontsize";
import {fetchThemeLessons, LessonType} from "../../redux/slises/themeLessonsSlice.ts";
import {fetchControlWork, fetchControlWorkBySeminarian} from "../../redux/slises/controlWorkSlice.ts";
import {ROUTES} from "../../constants/Routes.ts";
import {fetchLessonData} from "../../redux/slises/lessonSlice.ts";
import Toast from "react-native-toast-message";

type BlockThemeItemBySeminarianProps = {
    blockTheme: BlockTheme,
    index: number;
}

export const BlockThemeItemBySeminarian: React.FC<BlockThemeItemBySeminarianProps> = ({blockTheme, index}) => {
    const dispatch = useAppDispatch()
    const navigation = useNavigation()

    const onPressHandler = async () => {
        try {
            switch (blockTheme.type) {
                case 'control':
                    if (blockTheme?.topicLesson.length == 0) {
                        Toast.show({
                            type: 'info',
                            text1: 'Ошибка',
                            text2: 'Нет контрольной!',
                            position: 'bottom',
                            bottomOffset: 50,
                        });
                        return;
                    }
                    dispatch(fetchControlWorkBySeminarian(+blockTheme?.topicLesson[0]?.material_id));
                    // @ts-ignore
                    navigation.navigate(ROUTES.CONTROL_WORK_CHECK);
                    break;

                case 'topic': {
                    const lessons = await dispatch(
                        fetchThemeLessons({themeId: blockTheme.id})
                    ).unwrap();

                    if (!lessons.data?.length) {
                        Toast.show({
                            type: 'info',
                            text1: 'Ошибка',
                            text2: 'Нет уроков в этой теме!',
                            position: 'bottom',
                            bottomOffset: 50,
                        });
                        return;
                    }

                    const firstLesson = lessons.data[0];
                    dispatch(fetchLessonData({lessonId: firstLesson.id}));
                    // @ts-ignore
                    navigation.navigate(ROUTES.LESSON_CHECK);
                    break;
                }

                case 'probe':
                    Toast.show({
                        type: 'info',
                        text1: 'В разработке',
                        text2: 'Функционал пробных работ в разработке',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                    break;

                default:
                    console.warn(`Неизвестный тип темы: ${blockTheme.type}`);
                    break;
            }
        } catch (error) {
            console.error('Ошибка обработки темы:', error);
        }
    };


    return (
        <TouchableOpacity style={styles.card} onPress={onPressHandler}>
            <View style={styles.indexContainer}>
                <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.title}>{blockTheme.name}</Text>
                {blockTheme?.description && renderDescription(blockTheme.description)}
            </View>
            <View>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
                    // @ts-ignore
                     xmlns="http://www.w3.org/2000/svg">
                    <Path d="M8.59 16.34L13.17 12 8.59 7.66L10 6.25L16 12.25L10 18.25L8.59 16.34Z" fill="#2B2D3E"/>
                </Svg>
            </View>

        </TouchableOpacity>
    );
};

const renderDescription = (description: string) => {
    try {
        const parsed = JSON.parse(description);

        // Проверяем, что это "rich text"-формат
        if (parsed?.type === 'doc' && Array.isArray(parsed.content)) {
            return parsed.content.map((block: any, index: number) => {
                if (block.type === 'paragraph' && block.content) {
                    return (
                        <Text key={index} style={styles.description}>
                            {block.content.map((item: any) => item.text).join(' ')}
                        </Text>
                    );
                }
                return null;
            });
        }
    } catch (e) {
        // Если JSON.parse не прошёл — значит, это обычная строка
    }

    return <Text style={styles.description}>{description}</Text>;
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 15,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 11,
        paddingVertical: 15,
        borderWidth: 1,
        backgroundColor: '#e7ecf2',
        borderColor: Colors.background,
        gap: 15,
        marginBottom: 15,
    },
    description: {
        fontSize: 15,
        color: '#000',
        marginTop: 4,
    },
    indexContainer: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        // marginTop: 4, // чуть приподнимаем цифру
    },
    indexText: {
        fontSize: RFValue(12, 680),
        fontWeight: '400',
        color: Colors.colorBlack,
    },
    title: {
        fontSize: RFValue(14, 680),
        fontWeight: 'bold',
        color: Colors.colorBlack,

    },
});
