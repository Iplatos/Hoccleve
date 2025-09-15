import React from 'react';
import {FlatList, StyleSheet, Text, View} from "react-native";
import {useAppSelector} from "../redux/hooks.ts";
import {GlobalStyle} from "../constants/GlobalStyle.ts";
import {Colors} from "../constants/Colors.ts";
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";
import {LessonNavigationBySeminarian} from "../components/LessonNavigation/LessonNavigationBySeminarian.tsx";
import {BlocksRenderer} from "../components/BlocksRenderer/BlocksRenderer.tsx";
import {SurveyCard} from "../components/SurveyCard/SurveyCard.tsx";
import {LessonTask} from "../redux/slises/homeworkSlice.ts";
import {CheckPassWordsComponent} from "../components/TestComponents/CheckBySeminarian/CheckPassWordsComponent.tsx";
import {CheckExactAnswerComponent} from "../components/TestComponents/CheckBySeminarian/CheckExactAnswerComponent.tsx";
import {CheckTestComponent} from "../components/TestComponents/CheckBySeminarian/CheckTestComponent.tsx";
import {CheckMatchComponent} from "../components/TestComponents/CheckBySeminarian/CheckMatchComponent.tsx";
import {CheckFileAnswerComponent} from "../components/TestComponents/CheckBySeminarian/CheckFileAnswerComponent.tsx";
import {CheckOrderComponent} from "../components/TestComponents/CheckBySeminarian/CheckOrderComponent.tsx";
import {
    CheckDetailAnswerComponent
} from "../components/TestComponents/CheckBySeminarian/CheckDetailAnswerComponent.tsx";
import {ControlTask} from "../redux/slises/controlWorkSlice.ts";

export const ControlWorkCheck = () => {

    const controlWork = useAppSelector(state => state.controlWork.data)
    //  console.log('Control Work', controlWork)

    const renderTaskItem = ({item, index}: { item: ControlTask; index: number }) => {
        const {type} = item.task;
        // console.log(type)
        switch (type) {
            // case 'pass-words':
            //     return <CheckPassWordsComponent task={item.task} index={index}/>;
            // case 'exact-answer':
            //     return <CheckExactAnswerComponent task={item.task} index={index}/>;
            // case 'test':
            //     return <CheckTestComponent task={item.task} index={index}/>;
            // case 'match':
            //     return <CheckMatchComponent task={item.task} index={index}/>;
            case 'file-answer':
                return <CheckFileAnswerComponent task={item.task} index={index}/>;
            // case 'order':
            //     return <CheckOrderComponent task={item.task} index={index}/>;
            case 'detail-answer':
                return <CheckDetailAnswerComponent task={item.task} index={index}/>;
            default:
                return (
                    <View>
                        <Text>Неизвестный тип {type}</Text>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <CoursesHeader title={controlWork?.name}/>
                    </>
                }
                data={controlWork?.controlTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTaskItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: Colors.white
    },
    title: {
        textAlign: 'center',
        marginVertical: 15
    }

});