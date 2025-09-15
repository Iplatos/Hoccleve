import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Dimensions, StyleSheet, Text, View} from 'react-native';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import {CourseCard} from "./CourseCard.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {ArrowsComponent} from "../ArrowsComponent/ArrowsComponent.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from "../../context/AuthContext.tsx";
import {getUrl} from "../../settings/utils.ts";

const {width} = Dimensions.get('window');

export const Courses: React.FC = () => {
    const {courses, status, error} = useAppSelector(state => state.studentCourses);
    const ref = React.useRef<ICarouselInstance>(null);
    const settings = useAppSelector((state) => state.settings.data);
    const [url, setUtl] = useState<string | null>(null)
    const isDisplayFullNameSeminarian = settings?.find(set => set.key === 'isDisplayFullNameSeminarian')?.value === '1'
    const isFreeCourses = settings?.find(set => set.key === 'isFreeCourses')?.value === '0'
    const isHideCoursesOnTheMainPageInTheSection = settings?.find(el => el.key === 'isHideCoursesOnTheMainPageInTheSection')?.value === '1'


    const filteredCourses = courses.filter(el => !!el.direction)

    const handlePrev = () => {
        ref.current?.prev()
    };

    const handleNext = () => {
        ref.current?.next()
    };


    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUtl(value);
        };

        fetchUrl();

    }, []);

    if (status === 'loading') {
        return (
            <View style={styles.container}>
                <ActivityIndicator/>
            </View>

        );
    }

    if (status === 'failed') {
        return <View><Text>{error}</Text></View>;
    }

    if (isHideCoursesOnTheMainPageInTheSection) {
        return <></>
    }


    return (
        <View style={styles.container}>
            <View style={[styles.arrowBlock, {paddingHorizontal: 15}]}>
                <Text style={GlobalStyle.titleGL}>Мои курсы</Text>
                {filteredCourses.length > 0 && <ArrowsComponent handlePrev={handlePrev} handleNext={handleNext}/>}
            </View>
            {filteredCourses.length === 0
                ? <View style={{paddingHorizontal: 15}}><Text>Нет курсов</Text></View>
                : <Carousel
                    ref={ref}
                    loop={false}
                    width={width}
                    height={isDisplayFullNameSeminarian ? 180 : 150}
                    autoPlay={false}
                    data={filteredCourses}
                    scrollAnimationDuration={300}
                    renderItem={({item}) => (
                        <CourseCard
                            course={item}
                            isDisplayFullNameSeminarian={isDisplayFullNameSeminarian}
                            isFreeCourses={isFreeCourses}
                            url={url}
                        />
                    )}
                />
            }

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
        marginBottom: 20,

        // height: 205
    },
    arrowBlock: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between"

    }
});

