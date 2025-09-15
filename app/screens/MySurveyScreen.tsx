import React, {useEffect, useState} from 'react';
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";

import {View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, RefreshControl} from 'react-native';
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchMySurvey, fetchMySurveyAbout, MySurveyAbout} from "../redux/slises/surveySlice.ts";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../constants/Routes.ts";
import {Colors} from "../constants/Colors.ts";

export const MySurveyScreen = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const user = useAppSelector(state => state.user.user);
    const {mySurveyAbout, completeSurveyLoading, completeSurveyError} = useAppSelector(state => state.survey);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadSurveys = () => {
        dispatch(fetchMySurveyAbout({userId: user?.id!}));
    };

    useEffect(() => {
        loadSurveys();
        console.log('asdasd')
    }, []);

    const onRefresh = async () => {
        try {
            setIsRefreshing(true);
            await dispatch(fetchMySurveyAbout({userId: user?.id!})).unwrap();
        } catch (error) {
            console.error('Ошибка обновления:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const getMySurveyHandler = (surveyId: number) => {
        dispatch(fetchMySurvey({surveyId: surveyId}))
        // @ts-ignore
        navigation.navigate(ROUTES.SURVEY, {surveyId});
    }

    const renderItem = ({item}: { item: MySurveyAbout }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <TouchableOpacity style={styles.button} onPress={() => getMySurveyHandler(item?.report_id)}>
                <Text style={styles.buttonText}>Пройти опрос</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <CoursesHeader title="Опросы"/>
            {completeSurveyLoading && !isRefreshing ? (
                <ActivityIndicator style={styles.loader}/>
            ) : completeSurveyError ? (
                <Text style={styles.error}>Ошибка: {String(completeSurveyError)}</Text>
            ) : (
                <FlatList
                    data={mySurveyAbout?.data || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh}/>
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Опросов нет</Text>
                    }
                />
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: Colors.colorBlack,
    },
    loader: {
        marginTop: 20,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    list: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderColor: '#e0e0e0',
        borderWidth: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#fbe9ff',
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignSelf: 'flex-start',
        borderRadius: 8,
    },
    buttonText: {
        color: '#333',
        fontWeight: '500',
    },
});