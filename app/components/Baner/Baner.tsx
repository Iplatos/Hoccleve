import React, {useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {useAppSelector} from "../../redux/hooks.ts";
import ReanimatedCarousel from "react-native-reanimated-carousel";
import {Colors} from "../../constants/Colors.ts";

const {width} = Dimensions.get('window');

const getColor = (colorName: string) => {
    // Проверка на hex-код цвета (например, "#ffffff")
    if (/^#([0-9A-F]{3}){1,2}$/i.test(colorName)) {
        return colorName;
    }

    switch (colorName) {
        case 'blueGray':
            return Colors.colorBlueGray;
        case 'white':
            return Colors.colorWhite;
        case 'accent':
            return Colors.colorAccent;
        case 'violet':
            return Colors.colorViolet;
        case 'violetDark':
            return Colors.colorVioletDark;
        // Добавьте остальные цвета при необходимости
        default:
            return Colors.colorBlack; // Цвет по умолчанию, если цвет не найден
    }
};
export const Banner: React.FC = () => {
    const banners = useAppSelector(state => state.banners.banners);
    const bannerStatus = useAppSelector(state => state.banners.status);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePress = (link: string) => {
        const notLinkText = 'нет ссылки'

        if (link) {
            Linking.openURL(link).catch(err =>
                Alert.alert('Ошибка', 'Не удалось открыть ссылку')
            );
        } else {
            Alert.alert(`Ошибка, Не удалось открыть ссылку. Ссылка: ${notLinkText}`)
        }
    };

    if (bannerStatus === 'loading') {
        return <View style={styles.card}><ActivityIndicator/></View>;
    }


    if (banners.length === 0) {
        return (
            <></>
        );
    }

    const totalDots = 4;
    const getVisibleDots = () => {
        if (banners.length <= totalDots) {
            return banners.map((_, index) => index);
        }

        const half = Math.floor(totalDots / 2);
        let start = currentIndex - half;
        let end = currentIndex + half;

        if (start < 0) {
            start = 0;
            end = totalDots - 1;
        } else if (end >= banners.length) {
            start = banners.length - totalDots;
            end = banners.length - 1;
        }

        return Array.from({length: totalDots}, (_, i) => start + i);
    };

    const visibleDots = getVisibleDots();

    return (
        <View style={styles.carouselContainer}>
            <ReanimatedCarousel
                width={width}
                height={210}
                style={styles.card}
                data={banners}
                autoPlay
                autoPlayInterval={5000}
                onSnapToItem={(index) => setCurrentIndex(index)}
                renderItem={({item}) => {
                    return (
                        <View key={item.id} style={[styles.bannerSlide, {backgroundColor: getColor(item.background)}]}>
                            <Image source={{uri: item.image}} style={styles.bannerImage}/>
                            <View style={styles.bannerContent}>
                                <Text
                                    style={[styles.bannerTitle, {color: getColor(item.colorText)}]}>{item.title}</Text>
                                {item.subtitle && (
                                    <Text style={[styles.bannerSubtitle, {color: getColor(item.colorText)}]}>
                                        {item.subtitle}
                                    </Text>
                                )}
                                <Text numberOfLines={3}
                                      style={[styles.bannerDescription, {color: getColor(item.colorText)}]}>
                                    {item.description}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.buttonContainer]}
                                onPress={() => handlePress(item.linkButton)}>
                                <Text style={[styles.bannerButton, {
                                    backgroundColor: getColor(item.colorButton),
                                    color: getColor(item.colorTextButton)
                                }]}>
                                    {item.textButton}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />
            <View style={styles.pagination}>
                {visibleDots.map((dotIndex) => (
                    <View
                        key={dotIndex}
                        style={[
                            styles.dot,
                            dotIndex === currentIndex ? styles.activeDot : null,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    card: {
        //  flex: 1,
        width: width,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 20,
        justifyContent: 'center',
        height: 210,
    },
    bannerSlide: {
        flex: 1,
    },
    bannerImage: {
        width: 145,
        height: 145,
        position: 'absolute',
        resizeMode: 'contain',
        right: 0,
        bottom: 0,
    },
    bannerContent: {
        flex: 1,
        width: '75%',
        padding: 20,
        borderRadius: 8,
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bannerSubtitle: {
        fontSize: 16,
        marginBottom: 10,
    },
    bannerDescription: {
        fontSize: 14,
        marginBottom: 10,
    },
    bannerButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    buttonContainer: {
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 40,
        width: '100%',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.textActive,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: Colors.white,
    },
    errorContainer: {
        width: width,
        marginTop: 90,
        paddingHorizontal: 15,
        marginBottom: 20,
        justifyContent: 'center',
    },
});
