import React, {useEffect} from 'react';
import {View, StyleSheet, Dimensions, Text, ActivityIndicator} from 'react-native';
import ReanimatedCarousel, {ICarouselInstance} from 'react-native-reanimated-carousel';

import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {fetchNews} from "../../redux/slises/newsSlice.ts";
import {NewsCard} from "./NewsCard.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {ArrowsComponent} from "../ArrowsComponent/ArrowsComponent.tsx";


const {width} = Dimensions.get('window');

export const News = () => {
    const dispatch = useAppDispatch();

    const settings = useAppSelector((state) => state.settings.data);
    const news = useAppSelector((state) => state.news.data);
    const status = useAppSelector((state) => state.news.status);

    const isShowNewsStudent = settings?.find(el => el.key === 'isShowNewsStudent')?.value === '0'

    const ref = React.useRef<ICarouselInstance>(null);

    // useEffect(() => {
    //     if (status === 'idle') {
    //         dispatch(fetchNews());
    //     }
    // }, [status, dispatch]);

    const renderItem = ({item}: { item: any }) => {
        return <NewsCard news={item}/>;
    };

    const handlePrev = () => {
        ref.current?.prev()
    };

    const handleNext = () => {
        ref.current?.next()
    };


    if (isShowNewsStudent) {
        return null;
    }

    return (
        <View style={styles.carouselContainer}>
            {status === 'loading' ? <ActivityIndicator/>
                : (
                    <>
                        <View style={[styles.arrowBlock, {paddingHorizontal: 15}]}>
                            <Text style={GlobalStyle.titleGL}>Новости</Text>
                            {news.length > 0 && <ArrowsComponent handlePrev={handlePrev} handleNext={handleNext}/>}
                        </View>
                        {news.length === 0
                            ? <View style={{paddingHorizontal: 15}}><Text>Нет новостей</Text></View>
                            : <ReanimatedCarousel
                                ref={ref}
                                data={news}
                                renderItem={renderItem}
                                width={width}
                                height={300}
                                scrollAnimationDuration={400}
                                loop
                                autoPlayInterval={4000}
                            />}
                    </>
                )}
        </View>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 20,
    },
    arrowBlock: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between"

    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e80f0f',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#110909',
    },
});

