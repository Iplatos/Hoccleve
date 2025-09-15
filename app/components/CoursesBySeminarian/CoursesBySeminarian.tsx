import {View, Text, Image, FlatList, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import Carousel, {ICarouselInstance} from "react-native-reanimated-carousel";
import React, {useEffect, useRef, useState} from "react";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {ArrowsComponent} from "../ArrowsComponent/ArrowsComponent.tsx";
import {LinearGradient} from "expo-linear-gradient";
import {getUrl} from "../../settings/utils.ts";
import {Colors} from "../../constants/Colors.ts";
import {fetchDirectionPlanBySeminarian} from "../../redux/slises/directionPlanSlice.ts";
import Toast from "react-native-toast-message";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../../constants/Routes.ts";

const {width} = Dimensions.get('window');

export const CoursesBySeminarian = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const directionsBySeminarian = useAppSelector(state => state.directionsBySeminarian.data);
    const ref = React.useRef<ICarouselInstance>(null);


    const [url, setUrlState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };
        fetchUrl();
    }, []);

    const handlePrev = () => {
        ref.current?.prev()
    };

    const handleNext = () => {
        ref.current?.next()
    };

    const handlePress = async (course_id: number) => {
        try {
            setIsLoading(true);
            await dispatch(fetchDirectionPlanBySeminarian(course_id)).unwrap()
            // @ts-ignore
            navigation.navigate(ROUTES.COURSE_DETAIL, { courseId: course_id });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка!',
                text2: 'Не удалось загрузить курс или темы',
                position: 'bottom',
                bottomOffset: 50,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={[styles.arrowBlock, {paddingHorizontal: 15}]}>
                <Text style={GlobalStyle.titleGL}>Мои курсы</Text>
                {directionsBySeminarian.length > 0 &&
                    <ArrowsComponent handlePrev={handlePrev} handleNext={handleNext}/>}
            </View>
            <Carousel
                ref={ref}
                loop={false}
                width={width}
                height={150}
                autoPlay={false}
                data={directionsBySeminarian}
                scrollAnimationDuration={300}
                renderItem={({item}) => (
                    <TouchableOpacity
                        style={{flex: 1}}
                        disabled={isLoading}
                        onPress={() => handlePress(item.direction_id)}>
                        <LinearGradient colors={['#fff', '#f3efef', '#f0f9ff', '#e9f6ff']} style={styles.card}>
                            {isLoading && (
                                <View style={styles.loaderContainer}>
                                    <ActivityIndicator/>
                                </View>
                            )}
                            <Text style={styles.title}>{item.direction.name}</Text>
                            <View style={{justifyContent: 'center'}}>
                                <View style={styles.line}></View>
                                <Image source={{uri: `${url}${item.direction.icon_path}`}} style={styles.image}/>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 20
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    arrowBlock: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between"

    },
    card: {
        flex: 1,
        borderRadius: 12,
        padding: 11,
        paddingBottom: 50,
        borderWidth: 1,
        borderColor: Colors.background,
        gap: 15,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2D3E',
    },
    line: {
        width: '80%',
        height: 5,
        backgroundColor: '#d0e0ff',
        borderRadius: 5,
    },
    image: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        position: 'absolute',
        right: 0,
        zIndex: 50
    },
});
