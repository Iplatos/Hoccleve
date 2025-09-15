import React, { useEffect } from 'react';
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {fetchTimetable} from "../../redux/slises/calendarSlice.ts";
import {ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View} from "react-native";


export const Timetable: React.FC = () => {
    const dispatch = useAppDispatch();
    const timetable = useAppSelector(state => state.timetable);

    useEffect(() => {
        dispatch(fetchTimetable());
    }, [dispatch]);

    if (timetable.status === 'loading') {
        return <ActivityIndicator  color="#0000ff" />;
    }

    if (timetable.status === 'failed') {
        return <View style={styles.errorContainer}><Text style={styles.errorText}>Error: {timetable.error}</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Timetable</Text>
            {/*{timetable.data.map(event => (*/}
            {/*    <View key={event.id} style={styles.eventContainer}>*/}
            {/*        <Text style={styles.timeText}>{event.start_time} - {event.end_time}</Text>*/}
            {/*        /!*<Text style={styles.directionText}>{event.direction.name}</Text>*!/*/}
            {/*        /!*<Text style={styles.childrenText}>{event.children.name}</Text>*!/*/}
            {/*        <Text style={styles.linkText} onPress={() => Linking.openURL(event.link_to_meeting)}>Join Meeting</Text>*/}
            {/*    </View>*/}
            {/*))}*/}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    eventContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    timeText: {
        fontSize: 16,
        marginBottom: 8,
    },
    directionText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    childrenText: {
        fontSize: 16,
        marginBottom: 8,
    },
    linkText: {
        fontSize: 16,
        color: 'blue',
        textDecorationLine: 'underline',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});


