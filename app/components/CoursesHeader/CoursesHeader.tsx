import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Path, Svg} from "react-native-svg";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {Colors} from "../../constants/Colors.ts";
import {useNavigation, useRoute} from "@react-navigation/native";
import {ROUTES} from "../../constants/Routes.ts";
import {useAppSelector} from "../../redux/hooks.ts";

type CoursesHeaderProps = {
    title: string | undefined
}

export const CoursesHeader = ({title}: CoursesHeaderProps) => {
    const navigation = useNavigation();
    const route = useRoute();
    const {groupID, type, course_id} = useAppSelector(state => state.studentCourses);

    // Хранение истории экранов
    const screenHistory = useRef<string[]>([]);

    useEffect(() => {
        // Добавляем текущий экран в историю (если он не последний в списке)
        if (screenHistory.current[screenHistory.current.length - 1] !== route.name) {
            screenHistory.current.push(route.name);
        }
    }, [route.name]);

    const handleGoBack = () => {
        if (screenHistory.current[0] === 'control-work') {
            // @ts-ignore
            navigation.navigate(ROUTES.MAIN)

            // navigation.navigate(ROUTES.BLOCK_THEMES, {
            //     groupId: groupID ?? undefined,
            //     blockId: Number(course_id),
            //     type: type
            // });
            return
        }
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else if (screenHistory.current.length > 1) {
            // Удаляем текущий экран и переходим на предыдущий
            screenHistory.current.pop();
            const previousScreen = screenHistory.current[screenHistory.current.length - 1];
            navigation.navigate(previousScreen as never);
        } else {
            // Если истории нет — отправляем на главный экран
            navigation.navigate("Home" as never);
        }
    };

    return (
        <View style={styles.headerBlock}>
            <TouchableOpacity style={styles.btn} onPress={handleGoBack}>
                <Svg
                    // @ts-ignore
                    xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
                    <Path fillRule="evenodd" clipRule="evenodd"
                          d="M0.21967 6.53033C-0.0732233 6.23744 -0.0732233 5.76256 0.21967 5.46967L5.21967 0.46967C5.51256 0.176777 5.98744 0.176777 6.28033 0.46967C6.57322 0.762563 6.57322 1.23744 6.28033 1.53033L1.81066 6L6.28033 10.4697C6.57322 10.7626 6.57322 11.2374 6.28033 11.5303C5.98744 11.8232 5.51256 11.8232 5.21967 11.5303L0.21967 6.53033Z"
                          fill="#2B2D3E">
                    </Path>
                </Svg>
                <Text>Назад</Text>
            </TouchableOpacity>
            <Text style={[GlobalStyle.titleGL, {marginBottom: 0, flex: 1}]}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({

    headerBlock: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        gap: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 10
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.bgCard,
        paddingVertical: 5,
        paddingHorizontal: 7,
        borderRadius: 8
    },

});
