import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {Colors} from "../../constants/Colors.ts";
import {CustomPicker} from "../CustomPicker/CustomPicker.tsx";
import {RNCheckbox} from "../RNCheckbox/RNCheckbox.tsx";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {
    ConferenceItem,
    fetchConferencesWithoutStatus, MassReportItem,
    saveTimeOpeningLessonFirstTime, sendMassReport,
    updateConferenceStatus, UpdateConferenceType
} from "../../redux/slises/conferenceWithoutStatusSlice.ts";
import {formatDateFromTheLine} from "../../settings/utils.ts";
import moment from 'moment';
import 'moment/locale/ru';
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

moment.locale('ru'); // устанавливаем локаль по умолчанию

const screenWidth = Dimensions.get('window').width;

const lessonOptions = [
    {label: 'Проведено', value: '5'},
    {label: 'Отменено (педагог)', value: '11'},
    {label: 'Отменено (ученик)', value: '10'},
];

export const ClassReports = () => {
    const dispatch = useAppDispatch()

    const conferenceLessons = useAppSelector((state) => state.conferenceWithoutStatus.data);
    const filteredConferenceLessons = conferenceLessons.filter((el) => (el.end_date && el.interval_type == "regular") ? (+el.date_conference.replace(/[-\s]/g, '') <= +el.end_date.replace(/[-\s]/g, '')) : true).filter((el) => (el.start_date && el.interval_type == "regular") ? (+el.date_conference.replace(/[-\s]/g, '') >= +el.start_date.replace(/[-\s]/g, '')) : true)
    const settings = useAppSelector(state => state.settings.data)
    const isTeacherCannotReportOnTheLessonUntilHeHasGivenGradesToAllStudents = settings?.find(el => el.key === 'isTeacherCannotReportOnTheLessonUntilHeHasGivenGradesToAllStudents')?.value === '1'

    const [selectedLessons, setSelectedLessons] = useState<Record<string, MassReportItem>>({});
    const [reset, setReset] = useState(false);
    // console.log('conferenceLessons', conferenceLessons)
    console.log('filteredConferenceLessons', filteredConferenceLessons)
    console.log('selectedLessons', selectedLessons)


    const toggleLesson = (id: string, cancel_type: string, checked: boolean) => {
        if (checked) {
            const lesson = filteredConferenceLessons.find((lesson) => lesson.id === id);
            if (lesson) {
                setSelectedLessons((prev) => ({
                    ...prev,
                    [id]: {
                        cancel_type,
                        comment: '', // Пока пусто, зададим позже в модалке
                        date_conference: lesson.date_conference,
                        event_id: lesson.event_id,
                        id: lesson.id,
                        lesson_time_change: lesson.duration,
                        conference_type: lesson.conference_type

                    },
                }));
            }
        } else {
            setSelectedLessons((prev) => {
                const updated = {...prev};
                delete updated[id];
                return updated;
            });
        }
    };

    const updateStatusForAll = (cancel_type: string) => {
        setSelectedLessons((prev) =>
            Object.fromEntries(
                Object.entries(prev).map(([id, item]) => [
                    id,
                    {...item, cancel_type},
                ])
            )
        );
    };


    const onSubmitMassReport = async (comment: string) => {
        if (isTeacherCannotReportOnTheLessonUntilHeHasGivenGradesToAllStudents) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка!',
                text2: 'Нельзя отчитываться за занятие пока в эл.журе не выставлены оценки!',
                position: 'bottom',
                bottomOffset: 50,
            });

            return
        }
        if (!comment.trim()) {
            Alert.alert('Ошибка', 'Комментарий не может быть пустым');
            return;
        }
        const dataToSend: MassReportItem[] = Object.values(selectedLessons).map((item) => ({
            ...item,
            comment, // добавляем общий комментарий
        }));

        try {
            await dispatch(sendMassReport(dataToSend)).unwrap();
            await dispatch(fetchConferencesWithoutStatus());
            Toast.show({
                type: 'success',
                text1: 'Успешно!',
                text2: 'Отчёт отправлен',
                position: 'bottom',
                bottomOffset: 50,
            });
            setSelectedLessons({})
            setReset(true)

        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка!',
                text2: error?.message || 'Не удалось сохранить данные',
                position: 'bottom',
                bottomOffset: 50,
            });

        }
    };

    return (
        <View style={{flex: 1}}>
            <MassActionBlock
                selectedCount={Object.keys(selectedLessons).length}
                onSubmit={onSubmitMassReport}
                updateStatusForAll={updateStatusForAll}
                reset={reset}
            />

            <FlatList
                style={{width: '100%'}}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                data={filteredConferenceLessons}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <LessonCard
                        item={item}
                        isChecked={!!selectedLessons[item.id]}
                        onCheckChange={(checked, status) =>
                            toggleLesson(item.id, status, checked)
                        }
                    />
                )}
            />
        </View>
    );
};


interface LessonCardProps {
    item: ConferenceItem;
    isChecked: boolean;
    onCheckChange: (checked: boolean, status: string) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({item, isChecked, onCheckChange}) => {
    const dispatch = useAppDispatch()

    const settings = useAppSelector(state => state.settings.data)
    const isUpdateConferenceLoading = useAppSelector((state) => state.conferenceWithoutStatus.isUpdateConferenceLoading);
    const isTeacherCannotReportOnTheLessonUntilHeHasGivenGradesToAllStudents = settings?.find(el => el.key === 'isTeacherCannotReportOnTheLessonUntilHeHasGivenGradesToAllStudents')?.value === '1'

    const [selectedStatus, setSelectedStatus] = useState('');
    const isDisabledButton = selectedStatus.length === 0
    const [openedForFirstTime, setOpenedForFirstTime] = useState(item?.opened_at);
    const dateTimeEntryIntoClass = openedForFirstTime ? moment(openedForFirstTime).format('DD MMMM YYYY [в] HH:mm') : 'Не сохранено';
    const [loading, setLoading] = useState(false);

    const isTeacherArrivalTimeForTheMeeting = settings?.find(el => el.key === 'isTeacherArrivalTimeForTheMeeting')?.value === '1'
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [comment, setComment] = useState('');


    useEffect(() => {
        setOpenedForFirstTime(item?.opened_at)
    }, [item]);

    useEffect(() => {
        if (isChecked) {
            onCheckChange(true, selectedStatus);
        }
    }, [selectedStatus]);

    const startLessonHandler = async (link: string) => {
        setLoading(true);
        if (link) {
            try {
                const canOpen = await Linking.canOpenURL(link);
                if (canOpen) {
                    await Linking.openURL(link);
                } else {
                    Alert.alert('Ошибка', `Не удалось открыть ссылку: ${link}`);
                }
            } catch (error) {
                Alert.alert('Ошибка', `Произошла ошибка при открытии ссылки: ${link}`);
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Ошибка', `Не удалось открыть ссылку: ${link}`);
        }

        if ((dateTimeEntryIntoClass !== 'Не сохранено') || !isTeacherArrivalTimeForTheMeeting) {
            return;
        }

        try {
            setLoading(true);
            await dispatch(saveTimeOpeningLessonFirstTime(item?.id)).unwrap();
            await dispatch(fetchConferencesWithoutStatus());

            Toast.show({
                type: 'success',
                text1: 'Успешно!',
                text2: 'Время входа сохранено',
                position: 'bottom',
                bottomOffset: 50,
            });
        } catch (error) {
            // Ошибка при сохранении времени
            Toast.show({
                type: 'error',
                text1: 'Ошибка!',
                text2: error as string || 'Произошла ошибка при сохранении времени',
                position: 'bottom',
                bottomOffset: 50,
            });
        } finally {
            setLoading(false);
        }
    };


    const handleSave = async () => {
        const role = await AsyncStorage.getItem('USER_ROLE');

        if (isTeacherCannotReportOnTheLessonUntilHeHasGivenGradesToAllStudents) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка!',
                text2: 'Нельзя отчитываться за занятие пока в эл.журе не выставлены оценки!',
                position: 'bottom',
                bottomOffset: 50,
            });
            setIsModalVisible(false); // Закрываем модалку
            return
        }

        if (!comment.trim()) {
            Alert.alert('Ошибка', 'Комментарий не может быть пустым');
            return;
        }

        let payload: UpdateConferenceType;

        if (selectedStatus === '10' || selectedStatus === '11') {
            // отмена занятия — отправляем только comment и cancel_type
            payload = {
                comment,
                cancel_type: role!,
                date_conference: item.date_conference,
                id: +item?.id
            };
        } else {
            // обычный отчёт
            payload = {
                comment,
                date_conference: item.date_conference,
                lesson_time_change: item.duration,
                id: +item?.id
            };
        }

        try {
            await dispatch(updateConferenceStatus(payload)).unwrap();

            setIsModalVisible(false); // Закрываем модалку

            await dispatch(fetchConferencesWithoutStatus());
            Toast.show({
                type: 'success',
                text1: 'Успешно!',
                text2: 'Данные успешно сохранены',
                position: 'bottom',
                bottomOffset: 50,
            });
        } catch (error: any) {
            console.log(error)
            Toast.show({
                type: 'error',
                text1: 'Ошибка!',
                text2: error?.message || 'Не удалось сохранить данные',
                position: 'bottom',
                bottomOffset: 50,
            });
        }
    };


    return (
        <>
            <View style={styles.card}>
                <RNCheckbox
                    checkboxStyle={{width: 20, height: 20}}
                    isChecked={isChecked}
                    onPress={() => onCheckChange(!isChecked, selectedStatus)}
                    text={'Массовый отчет'}
                />
                <Text style={styles.title}>Отчитайтесь за текущее занятие</Text>
                <View style={styles.row}>
                    <Text style={styles.valueBlock}>Направление: {item?.group?.direction?.name}</Text>
                    <Text style={styles.valueBlock}>{formatDateFromTheLine(item?.date_conference)}</Text>
                    <Text style={styles.valueBlock}>{item?.group?.name}</Text>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Продолжительность занятия, минут</Text>
                        <View style={styles.valueBlock}>
                            <Text style={styles.value}>{item?.duration}</Text>
                        </View>
                    </View>
                    <Text style={styles.valueBlock}>{item.start_time.slice(0, 5)}</Text>
                    <CustomPicker
                        options={lessonOptions}
                        selectedValue={selectedStatus}
                        onValueChange={setSelectedStatus}
                        label={"Выберите статус"}
                    />
                    <TouchableOpacity
                        disabled={selectedStatus.length === 0}
                        onPress={() => setIsModalVisible(true)}
                        style={[styles.saveButton, isDisabledButton && styles.disabled]}
                    >
                        {/*{isUpdateConferenceLoading &&*/}
                        {/*    <View style={styles.loaderContainer}>*/}
                        {/*        <ActivityIndicator/>*/}
                        {/*    </View>*/}
                        {/*}*/}
                        <Text
                            style={styles.saveButtonText}>Сохранить</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    disabled={loading}
                    onPress={() => startLessonHandler(item?.link_to_meeting)}
                    style={styles.button}
                >
                    {loading &&
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator/>
                        </View>
                    }
                    <Text style={styles.buttonText}>Войти</Text>
                </TouchableOpacity>
                <Text style={styles.footer}>
                    Время начала
                    занятия: {formatDateFromTheLine(item?.date_conference)} в {item.start_time.slice(0, 5)}{'\n'}
                    Время входа на
                    занятие: {dateTimeEntryIntoClass}
                </Text>
            </View>
            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.modalWrapper}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Дайте комментарий выбранному статусу</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Напишите комментарий"
                                placeholderTextColor={Colors.textGray}
                                value={comment}
                                onChangeText={setComment}
                                multiline
                            />
                            <View style={{flexDirection: 'row', gap: 10}}>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    style={styles.saveButton}>

                                    {isUpdateConferenceLoading &&
                                        <View style={styles.loaderContainer}>
                                            <ActivityIndicator/>
                                        </View>
                                    }
                                    <Text style={styles.buttonText}>Сохранить</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setIsModalVisible(false)}
                                    style={[styles.saveButton, {backgroundColor: Colors.background}]}>
                                    <Text style={[styles.buttonText, {color: 'red',}]}>Закрыть</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </>

    );
};

interface MassActionBlockProps {
    selectedCount: number;
    onSubmit: (comment: string) => void;
    updateStatusForAll: (status: string) => void;
    reset: boolean
}

export const MassActionBlock: React.FC<MassActionBlockProps> = (
    {
        selectedCount,
        onSubmit,
        updateStatusForAll,
        reset
    }) => {
    const {isSendMassReportLoading} = useAppSelector(state => state.conferenceWithoutStatus)
    const [selectedStatus, setSelectedStatus] = useState('');
    const [comment, setComment] = useState('');

    const disabled = !comment.trim() || selectedCount === 0 || isSendMassReportLoading;

    useEffect(() => {
        if (selectedStatus) {
            updateStatusForAll(selectedStatus);
        }
    }, [selectedStatus]);

    useEffect(() => {
        if (reset) {
            setSelectedStatus('')
            setComment('')
        }
    }, [reset]);

    return (
        <View style={styles.container}>
            <Text style={styles.infoText}>Выбрано занятий: {selectedCount}</Text>
            <Text style={[styles.infoText]}>Выберите статус для всех:</Text>
            <CustomPicker
                options={lessonOptions}
                selectedValue={selectedStatus}
                onValueChange={setSelectedStatus}
                label={"Выберите статус"}
            />
            <TextInput
                style={styles.commentInput}
                placeholder="Комментарий"
                placeholderTextColor={Colors.textGray}
                multiline
                numberOfLines={3}
                value={comment}
                onChangeText={setComment}
            />

            <TouchableOpacity
                disabled={disabled}
                style={[styles.saveButton, disabled && styles.disabled]}
                onPress={() => onSubmit(comment)}
            >
                {isSendMassReportLoading &&
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator/>
                    </View>
                }
                <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
                Время каждого занятия будет{'\n'}
                взято из полей на карточках занятия
            </Text>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginVertical: 15,
        backgroundColor: '#f6f5f5'
    },
    disabled: {
        opacity: 0.5,
    },
    modalWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        height: 80,
        borderColor: '#ccc',
        borderWidth: 1,
        width: '100%',
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    card: {
        width: screenWidth * 0.85,
        marginRight: 20,
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 10,
        padding: 10,
        marginVertical: 8,
        backgroundColor: '#FFF',
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: '#FFC93E',
        padding: 15,
        borderRadius: 8,
        // flex: 1,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 6,
        color: '#000',
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#dddce3',
        borderRadius: 8,
        padding: 10,
        textAlignVertical: 'top',
        marginBottom: 12,
        color: '#000',
    },
    saveButtonText: {
        color: '#000',
        fontWeight: '600',
        textAlign: 'center',
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    valueBlock: {
        paddingVertical: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#dddce3',
        borderRadius: 8,
        paddingLeft: 5
    },
    infoContainer: {
        flex: 1,
        // alignSelf: 'center'
    },
    label: {
        fontSize: 14,

        color: Colors.colorBlack,
        marginBottom: 3,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 12,
        fontSize: 16,
        marginTop: 15
    },
    row: {
        flexDirection: 'column',
        gap: 10,
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#FFC93E',
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        borderRadius: 4,
        marginBottom: 10,
    },
    buttonText: {
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 10,
        fontSize: 14,
        color: '#000',
    },
});


