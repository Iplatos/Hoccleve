import React, {useCallback, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, View} from "react-native";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {Colors} from "../constants/Colors.ts";
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";
import {BlockThemeItem} from "../components/BlockThemeItem/BlockThemeItem.tsx";
import {BlockTheme, fetchBlockThemes} from "../redux/slises/blockThemesSlice.ts";
import {ScheduleProgressBar} from "../components/ScheduleProgressBar/ScheduleProgressBar.tsx";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {hasRole} from "../settings/helpers.tsx";
import {BlockThemeItemBySeminarian} from "../components/BlockThemeItem/BlockThemeItemBySeminarian.tsx";

export const BlockThemesScreen = ({route}: any) => {
    const dispatch = useAppDispatch();
    const {groupId = null, blockId = null, type = 'private'} = route?.params || {};

    const {blockID} = useAppSelector(state => state.studentCourses);
    const user = useAppSelector(state => state.user.user);
    const blockThemes = useAppSelector(state => state.blockThemes)
    const loading = useAppSelector(state => state.blockThemes.loading)

    const [refreshing, setRefreshing] = useState(false);

    const isSeminarian = user ? hasRole(user, "seminarian") : false;
    const isStudent = !isSeminarian;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (isSeminarian && blockID) {
            dispatch(fetchBlockThemes({blockId: blockID})).finally(() => setRefreshing(false));
        } else {
            dispatch(fetchBlockThemes({groupId, type, blockId}))
                .finally(() => setRefreshing(false));
        }
    }, [dispatch]);

    const renderItem = ({item, index}: { item: BlockTheme, index: number }) => {
        if (isSeminarian) {
            return <BlockThemeItemBySeminarian blockTheme={item} index={index}/>
        } else {
            return <BlockThemeItem
                blockTheme={item} index={index}/>
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CoursesHeader title={blockThemes.block_name}/>
            {isStudent && <ScheduleProgressBar progress={blockThemes.passed_percents}/>}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator/>
                </View>
            ) : (
                <FlatList
                    data={blockThemes.data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />
            )}
            <Toast config={toastConfig}/>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
    },
    progress: {
        fontSize: 18,
        marginBottom: 10,
    },
    time: {
        fontSize: 16,
        color: '#f10808',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#666',
    },
});
