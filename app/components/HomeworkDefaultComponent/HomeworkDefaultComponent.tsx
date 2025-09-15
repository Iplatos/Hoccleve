import React from 'react';
import {StyleSheet, View} from 'react-native';
import {HomeworkComponent} from "../HomeworkComponent/HomeworkComponent.tsx";
import {useAuth} from "../../context/AuthContext.tsx";
import {CoursesHeader} from "../CoursesHeader/CoursesHeader.tsx";


export const HomeworkDefaultComponent = () => {
    const {authState} = useAuth()

    return (
        <View style={styles.container}>
            <HomeworkComponent
                id={authState?.userId!}
            />
        </View>
    );
};

// Стили для компонента
const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});


