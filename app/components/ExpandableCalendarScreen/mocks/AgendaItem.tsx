import isEmpty from 'lodash/isEmpty';
import React, {useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {RFValue} from "react-native-responsive-fontsize";
import {Colors} from "../../../constants/Colors.ts";
import Toast from "react-native-toast-message";
import {EditIcon} from "../../../assets/icons/Edit-icon.tsx";
import {CustomPicker} from "../../CustomPicker/CustomPicker.tsx";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks.ts";
import {
    BlockThemeSeminarian,
    changeTopic,
    DirectionCourse,
    DirectionCourseItem,
    fetchSeminarianCourse,
    fetchSeminarianTheme,
    fetchSeminarianTopics,
    rescheduleLesson
} from "../../../redux/slises/seminarian/seminarianTopicsSlice.ts";
import {fetchCalendarBySeminarian} from "../../../redux/slises/calendarSlice.ts";
import {initialDate} from "../../../settings/Settings.ts";


interface ItemProps {
    item: any;
    isSeminarian: boolean
}

const lessonOptions = [
    {label: 'Изменить комментарий (Видите только вы)', value: 'comment'},
    {label: 'Изменить аудиторию или материалы к занятию', value: 'auditory'},
    {label: 'Выбрать тему урока и комментарий к ДЗ', value: 'topic'},
];

const typeListOptions = [
    {label: 'Тема', value: 'topic'},
    {label: 'Контрольная', value: 'control'},
    {label: 'Коллоквиум', value: 'colloquium'},
    {label: 'Пробник', value: 'probe'},
];

const getPlaceholder = (type: string) => {
    switch (type) {
        case 'topic':
            return 'Выберите топик';
        case 'control':
            return 'Выберите контрольную';
        case 'colloquium':
            return 'Выберите коллоквиум';
        case 'probe':
            return 'Выберите пробник';
        default:
            return 'Выберите тип';
    }
};

export const AgendaItem = (props: ItemProps) => {
    const {item, isSeminarian} = props;
    const user = useAppSelector(state => state.user.user);

    const dispatch = useAppDispatch();
    const directionCourses = useAppSelector(state => state?.seminarianTopics?.data?.directionCourses);
    const courses = useAppSelector(state => state?.seminarianTopics?.seminarianCourse?.data);
    const works = useAppSelector(state => state?.seminarianTopics?.seminarianTheme?.data?.data);
    const isLoadingRescheduleLesson = useAppSelector(state => state?.seminarianTopics?.isLoadingRescheduleLesson);

    const selectLessonsData = useMemo(() => selectLessons(directionCourses!), [directionCourses]);
    const selectCoursesData = useMemo(() => selectCourses(courses!), [courses]);
    const selectWorckData = useMemo(() => selectWorks(works!), [works]);

    //  console.log('courses', courses)
    const status = item.isOffline === 1 ? 'Offline' : 'Online';
    //  console.log('item', item)
    const lessonType = item.conference_type === "private" ? 'Индивидуальное' : 'Групповое'
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [manualTopic, setManualTopic] = useState('');
    const [isManual, setIsManual] = useState(false);


    const [comment, setComment] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [changeAllLessons, setChangeAllLessons] = useState(false);
    const [offlineLesson, setOfflineLesson] = useState(false);
    const [auditoryNumber, setAuditoryNumber] = useState('');
    const [chooseMaterial, setChooseMaterial] = useState(false);
    const [course, setCourse] = useState('');
    const [work, setWork] = useState('');
    const [type, setType] = useState('');

    const showHomeworkBlock = selectedAction === 'topic';
    const showChangeAuditorBlock = selectedAction === 'auditory';
    const showCommentBlock = selectedAction === 'comment';

    useEffect(() => {
        if (showCommentBlock && item.comment) {
            setComment(item.comment)
        }
    }, [showCommentBlock]);


    const placeholder = getPlaceholder(type);

    useEffect(() => {
        if (showHomeworkBlock) {
            dispatch(fetchSeminarianTopics(item?.direction?.id))
        }
        if (showChangeAuditorBlock) {
            dispatch(fetchSeminarianCourse(item?.direction?.id))
        }

    }, [selectedAction])

    useEffect(() => {
        if (type) {
            setWork('')
            dispatch(fetchSeminarianTheme({blockId: course, type}))
        }
    }, [type])


    const resetForm = () => {
        setSelectedAction('');
        setManualTopic('');
        setComment('');
        setIsManual(false);
        setCourse('');
        setType('');
        setChangeAllLessons(false);
        setOfflineLesson(false);
        setAuditoryNumber('');
        setChooseMaterial(false);
    };

    const handlePress = async (link: string) => {
        setLoading(true);
        try {
            if (item.deny_access) {
                Toast.show({
                    type: 'info',
                    text1: 'Нет доступа',
                    text2:
                        'У Вас не оплачен курс. \n' +
                        'Свяжитесь с тех. Поддержкой',
                    position: 'bottom',
                    bottomOffset: 50,
                });
                return;
            }
            if (link) {
                await Linking.openURL(link);
            } else {
                Alert.alert('Ссылка не найдена', 'Ссылка отсутствует');
            }
        } catch (err) {
            Alert.alert('Ошибка', `Не удалось открыть ссылку: ${link}`);
        } finally {
            setLoading(false);
        }
    };

    if (isEmpty(item)) {
        return (
            <View style={styles.emptyItem}>
                <Text style={styles.emptyItemText}>No Events Planned Today</Text>
            </View>
        );
    }

    const handleEditPress = () => {
        setModalVisible(true);
    };

    const saveHandler = async () => {
        if (!selectedAction) {
            setSelectedAction('');
            setModalVisible(false);
            return;
        }

        const commonData = {
            date: item.date_conference,
            interval_type: item.interval_type,
        };

        let action: any;
        let payload: any;

        switch (selectedAction) {
            case 'topic':
                action = changeTopic;
                payload = {
                    ...commonData,
                    comment_to_dz: comment,
                    lesson_topic: manualTopic,
                    type: 'changeTopic',
                };
                break;

            case 'auditory':
                action = rescheduleLesson;
                payload = {
                    ...commonData,
                    is_offline: item.is_offline === 1,
                    audience_number: auditoryNumber,
                    is_choose_material: chooseMaterial,
                    material_comment: comment,
                    direction_course_id: course,
                    lesson_type: type,
                    topic_lesson_id: item.topic_lesson_id,
                    material_id: item.material_id,
                    type: 'changeMaterial',
                };
                break;

            case 'comment':
                action = rescheduleLesson;
                payload = {
                    ...commonData,
                    comment,
                    type: 'changeComment',
                };
                break;

            default:
                return;
        }

        try {
            await dispatch(action({id: item.id, payload})).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Успешно',
                text2: 'Занятие сохранено',
                position: 'bottom',
                bottomOffset: 50,
            });
            await dispatch(fetchCalendarBySeminarian({date:initialDate, speaker_id: user?.id!}));

            setModalVisible(false);
            resetForm()
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: error as string || 'Произошла ошибка',
                position: 'bottom',
                bottomOffset: 50,
            });
        }
    };


    //  console.log('selectedAction', selectedAction)

    return (
        <View style={styles.card}>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</Text>
                <Text style={styles.modeText}>{status}</Text>
                {isSeminarian && <TouchableOpacity style={{padding: 6}} onPress={handleEditPress}>
                    <EditIcon/>
                </TouchableOpacity>}
            </View>

            {/*{<View style={styles.groupContainer}>*/}
            {/*    <Text style={styles.groupLabel}>{lessonType}</Text>*/}
            {/*</View>}*/}
            {item?.groups.length > 0 && <View style={styles.groupContainer}>
                {/*<Text style={styles.groupLabel}>Группа</Text>*/}
                <Text style={styles.groupText}>{item.groupsText[0]}</Text>
            </View>}

            {item?.audience_number && <View style={{flexDirection: 'row'}}>
                <Text style={styles.modeText}>Аудитория №</Text>
                <Text style={styles.modeText}>{item?.audience_number}</Text>
            </View>}

            <View style={styles.subjectContainer}>
                <Text style={styles.subjectText}>{item.directionName}</Text>
            </View>
            <Text>{item.seminariansNames[0]}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => {
                handlePress(item.link_to_meeting)
            }}>
                {loading ? <ActivityIndicator size="small" style={{marginRight: 5}}/> :
                    <Text style={styles.btnText}> Перейти</Text>}
            </TouchableOpacity>

            {/* Modal for editing schedule */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => {
                    console.log('TouchableWithoutFeedback')
                    setModalVisible(false)
                    resetForm()
                }}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback onPress={() => {
                        }}>
                            <View style={styles.container}>
                                <Text style={styles.title}>Внести изменения в расписание</Text>
                                <CustomPicker
                                    options={lessonOptions}
                                    selectedValue={selectedAction}
                                    onValueChange={setSelectedAction}
                                />
                                {
                                    showCommentBlock && <TextInput
                                        placeholder="Комментарий"
                                        multiline={true}
                                        value={comment}
                                        placeholderTextColor={Colors.colorBlack}
                                        onChangeText={setComment}
                                        style={styles.input}
                                    />
                                }

                                {showChangeAuditorBlock && (
                                    <>
                                        <View style={styles.manualInputRow}>
                                            <Switch value={changeAllLessons} onValueChange={setChangeAllLessons}/>
                                            <TouchableOpacity onPress={() => setChangeAllLessons(!changeAllLessons)}>
                                                <Text>Изменить все последующие уроки с этим учеником / группой</Text>
                                            </TouchableOpacity>

                                        </View>

                                        <View style={styles.manualInputRow}>
                                            <Switch value={offlineLesson} onValueChange={setOfflineLesson}/>
                                            <TouchableOpacity onPress={() => setOfflineLesson(!offlineLesson)}>
                                                <Text>Офлайн/самостоятельное офлайн занятие</Text>
                                            </TouchableOpacity>

                                        </View>

                                        {offlineLesson && (
                                            <>
                                                <TextInput
                                                    placeholder="Впишите номер аудитории"
                                                    value={auditoryNumber}
                                                    placeholderTextColor={Colors.colorBlack}
                                                    onChangeText={setAuditoryNumber}
                                                    style={styles.input}
                                                />
                                                <View style={styles.manualInputRow}>
                                                    <Switch value={chooseMaterial} onValueChange={setChooseMaterial}/>
                                                    <TouchableOpacity
                                                        onPress={() => setChooseMaterial(!chooseMaterial)}>
                                                        <Text>Выбрать материал для урока</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        )}

                                        {chooseMaterial && (
                                            <>
                                                <TextInput
                                                    placeholder="Комментарий к материалу"
                                                    value={comment}
                                                    placeholderTextColor={Colors.colorBlack}
                                                    onChangeText={setComment}
                                                    style={styles.input}
                                                />
                                                <CustomPicker
                                                    selectedValue={course}
                                                    onValueChange={setCourse}
                                                    options={selectCoursesData}
                                                    label={"Выберите курс"}
                                                />
                                                <CustomPicker
                                                    selectedValue={type}
                                                    onValueChange={setType}
                                                    options={typeListOptions}
                                                    label={'Выберите тип'}
                                                />

                                                {
                                                    type && <CustomPicker
                                                        selectedValue={work}
                                                        onValueChange={setWork}
                                                        options={selectWorckData}
                                                        label={placeholder}
                                                    />
                                                }
                                            </>
                                        )}
                                    </>
                                )}
                                {showHomeworkBlock && (
                                    <>
                                        <Text style={styles.label}>Выберите тему урока и комментарий к ДЗ</Text>

                                        {!isManual ?
                                            <CustomPicker
                                                selectedValue={course}
                                                onValueChange={setCourse}
                                                options={selectLessonsData}
                                                label={'Выберите тему урока'}
                                            />
                                            : <TextInput
                                                style={styles.dropdownDisabled}
                                                placeholderTextColor={Colors.textBlack}
                                                placeholder="Введите тему урока"
                                                value={manualTopic}
                                                onChangeText={setManualTopic}
                                            />
                                        }

                                        <View style={styles.manualInputRow}>
                                            <Switch value={isManual} onValueChange={setIsManual}/>
                                            <TouchableOpacity onPress={() => setIsManual(!isManual)}>
                                                <Text style={styles.manualInputLabel}>Ввести название урока
                                                    вручную</Text>
                                            </TouchableOpacity>

                                        </View>
                                        <TextInput
                                            style={styles.dropdownDisabled}
                                            placeholder="Введите комментарий к ДЗ"
                                            placeholderTextColor={Colors.textBlack}
                                            value={comment}
                                            onChangeText={setComment}
                                        />
                                        <View style={styles.buttonRow}>
                                            <TouchableOpacity style={styles.clearButton} onPress={resetForm}>
                                                <Text style={styles.clearButtonText}>Очистить</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                                <TouchableOpacity
                                    disabled={isLoadingRescheduleLesson}
                                    style={styles.saveButton}
                                    onPress={saveHandler}>
                                    {isLoadingRescheduleLesson &&
                                        <View style={styles.loaderContainer}>
                                            <ActivityIndicator/>
                                        </View>
                                    }
                                    <Text
                                        style={styles.saveButtonText}>{selectedAction ? 'Сохранить' : 'Отменить'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default AgendaItem;

const selectLessons = (directionCourses: DirectionCourse[]) => {
    let res: { label: string, value: string }[] = [];
    directionCourses?.forEach(el => {
        el?.material?.forEach(elem => {
            elem?.topicLesson?.forEach(element => {
                res.push({label: element?.name, value: element?.id.toString()})
            })
        });
    });
    return res;
}

const selectCourses = (courses: DirectionCourseItem[]) => {
    let res: { label: string, value: string }[] = [];
    courses?.forEach(el => {
        res.push({label: el?.name, value: el?.id.toString()})
    });
    return res;
}

const selectWorks = (blocks: BlockThemeSeminarian[]) => {
    let res: { label: string, value: string }[] = [];
    blocks?.forEach(el => {
        el?.topicLesson?.forEach(elem => {
            res.push({label: elem?.name, value: elem?.id.toString()})
        });
    });
    return res;
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'column',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0000ff',
        padding: 10,
        margin: 10,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 10
    },
    timeText: {
        fontSize: RFValue(12, 680),
        // fontWeight: 'bold'
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,


    },

    modeText: {
        flex: 1,
        fontSize: 16,
        // color: 'grey'
    },
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        //marginBottom: 5
    },
    groupLabel: {
        fontSize: RFValue(10, 680),
        color: 'grey'
    },
    groupText: {
        fontSize: RFValue(13, 680),
        fontWeight: 'bold'
    },
    subjectContainer: {
        marginTop: 10
    },
    subjectText: {
        fontSize: RFValue(14, 680),
        fontWeight: 'bold'
    },
    btn: {
        width: '40%',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        backgroundColor: Colors.colorGreen,
        alignSelf: 'flex-start'
    },
    btnText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },


    emptyItem: {
        paddingLeft: 20,
        height: 52,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey'
    },
    emptyItemText: {
        color: 'lightgrey',
        fontSize: 14
    },

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },

    container: {
        padding: 20,
        backgroundColor: '#fafafa',
        marginHorizontal: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 14,
        color: '#333',
    },
    dropdownDisabled: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginBottom: 10,
    },

    manualInputRow: {
        width: '80%',
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    manualInputLabel: {
        marginLeft: 10,
        fontSize: 14,
        paddingVertical: 5
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    clearButton: {
        backgroundColor: '#f5e9ff',
        padding: 14,
        borderRadius: 8,
        flex: 1,
        //  marginRight: 10,
    },
    clearButtonText: {
        color: '#7933FF',
        fontWeight: '600',
        textAlign: 'center',
    },
    saveButton: {
        marginTop: 10,

        backgroundColor: '#FFC93E',
        padding: 15,
        borderRadius: 8,
        // flex: 1,
    },
    saveButtonText: {
        color: '#000',
        fontWeight: '600',
        textAlign: 'center',
    },

});
