import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {DirectionItem} from "../../redux/slises/directionPlanSlice.ts";
import {RFValue} from "react-native-responsive-fontsize";
import {Colors} from "../../constants/Colors.ts";
import Svg, {Path} from "react-native-svg";
import {useAppDispatch} from "../../redux/hooks.ts";
import {fetchBlockThemes} from "../../redux/slises/blockThemesSlice.ts";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../../constants/Routes.ts";
import {setBlockID, setCourseID} from "../../redux/slises/studentCoursesSlice.ts";

type CourseDetailCardProps = {
    courseDetail: DirectionItem,
    index: number;
}

export const CourseDetailCardBySeminarian: React.FC<CourseDetailCardProps> = ({courseDetail, index}) => {
    const dispatch = useAppDispatch()
    const navigation = useNavigation()

    const onPressHandler = () => {
        dispatch(fetchBlockThemes({blockId: +courseDetail.id}))
        dispatch(setBlockID(+courseDetail.id));
        // @ts-ignore
        navigation.navigate(ROUTES.BLOCK_THEMES)
    }

    return (
        <TouchableOpacity style={styles.card} onPress={onPressHandler}>
            <View style={styles.indexContainer}>
                <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.title}>{courseDetail.name}</Text>
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

