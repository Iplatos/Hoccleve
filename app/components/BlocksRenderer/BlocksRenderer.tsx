import React, {useEffect, useState} from "react";
import {
    Alert,
    FlexAlignType, Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {Colors} from "../../constants/Colors.ts";
import {useAppSelector} from "../../redux/hooks.ts";
import {ScormFile} from "../ScormFile/ScormFile.tsx";
import {getUrl} from "../../settings/utils.ts";
import WebView from "react-native-webview";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {Block, ImageType} from "../../redux/slises/lessonSlice.ts";
import YoutubePlayer from "react-native-youtube-iframe";
import {VideoRatingComponent} from "../VideoRatingComponent/VideoRatingComponent.tsx";


interface MaterialItem {
    media?: {
        name: string;
        path: string;
    };
    link?: string;
    name?: string;
    file?: any;
    id?: string
}

interface MaterialsBlockProps {
    block: {
        id: string | number;
        lessonMaterials?: MaterialItem[];
    };
}

interface VideosBlockProps {
    videos: MaterialItem[];
    url: string
}

export const BlocksRenderer: React.FC<{ blocksData: Block[] }> = ({blocksData}) => {
    // console.log('blocksData', blocksData)

    const [url, setUrlState] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };
        fetchUrl();
    }, []);

    // Преобразуем объект в массив и сортируем по order
    const blocksArray = blocksData
        ?.filter(block => typeof block === 'object' && block.id)
        ?.sort((a, b) => parseInt(a.order ?? '0') - parseInt(b.order ?? '0'));

    return (
        <View style={styles.container}>
            {blocksArray?.map(block => {
                switch (block.type) {
                    case 'title':
                        return <TitleBlock key={block.id} block={block}/>;
                    case 'text':
                        return <TextBlock key={block.id} block={block}/>;
                    case 'videos':
                        return <VideosBlock
                            key={block.id}
                            url={url!}
                            videos={block?.lessonVideos!}
                        />;
                    case 'materials':
                        return <MaterialsBlock key={block.id} block={block}/>;
                    case 'scorm':
                        return <ScormFile key={block.id} lesson={block}/>;
                    case 'pdf':
                        return <PdfBlock key={block.id} block={block}/>;
                    case 'image':
                        return <LessonImagesRenderer key={block.id} block={block} url={url!}/>
                    default:
                        return (
                            <View key={block.id} style={styles.block}>
                                <Text>Неизвестный тип: {block.type}</Text>
                            </View>
                        );
                }
            })}
        </View>
    );
};

const LessonImagesRenderer: React.FC<{ block: Block, url: string }> = ({block, url}) => {
    const images = block.lessonImages;

    const openLink = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(err => Alert.alert('Ошибка', `Не удалось открыть ссылку. Адрес ссылки: ${url}`));
        } else {
            Alert.alert('Ошибка', `Не удалось открыть ссылку: ${url ? url : 'нет ссылки'}`)
        }
    };

    const renderImage = (image: ImageType, index: number) => {
        const uri = `${url}${image.path}`;
        return (
            <TouchableOpacity
                key={index}
                style={[{marginVertical: 10},{alignItems: mapAlignToFlexAlign(block.align || 'center')}]}
                onPress={() => openLink(image.href)} activeOpacity={0.8}
            >
                <Image source={{uri}} style={styles.image}/>
            </TouchableOpacity>
        );
    };

    if (!images) return null;

    if (Array.isArray(images)) {
        return (
            <ScrollView horizontal>
                {images.map(renderImage)}
            </ScrollView>
        );
    }

    return renderImage(images, 0); // одиночный объект
};


const mapAlignToFlexAlign = (align?: string): FlexAlignType => {
    switch (align) {
        case 'center':
            return 'center';
        case 'right':
            return 'flex-end';
        case 'left':
        default:
            return 'flex-start';
    }
};
const TitleBlock: React.FC<{ block: Block }> = ({block}) => (
    <View
        style={[
            styles.block,
            styles.titleBlock,
            {alignItems: mapAlignToFlexAlign(block?.align!)}
        ]}
    >
        <Text
            style={[
                styles.titleText,
                {fontSize: block.size ? parseInt(block.size) * 4 + 12 : 20}
            ]}
        >
            {block.text}
        </Text>
    </View>
);


export const TextBlock: React.FC<{ block: Block }> = ({block}) => {
    const isJsonString = (str: any): boolean => {
        if (typeof str !== 'string' || str.trim() === '') return false;
        try {
            const parsed = JSON.parse(str);
            return typeof parsed === 'object' && parsed !== null;
        } catch {
            return false;
        }
    };

    const renderNode = (node: any, index?: number): React.ReactNode => {
        if (!node) return null;

        if ((node.type === 'doc' || node.type === 'paragraph') && Array.isArray(node.content)) {
            return node.content.map((child: any, i: number) => (
                <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ));
        }

        if (node.type === 'text') {
            let style: any = {};
            let onPress: (() => void) | undefined;

            (node.marks || []).forEach((mark: any) => {
                switch (mark.type) {
                    case 'bold':
                        style.fontWeight = 'bold';
                        break;
                    case 'italic':
                        style.fontStyle = 'italic';
                        break;
                    case 'underline':
                        style.textDecorationLine = 'underline';
                        break;
                    case 'textStyle':
                        if (mark.attrs?.color) {
                            style.color = mark.attrs.color;
                        }
                        break;
                    case 'link':
                        if (mark.attrs?.href) {
                            onPress = () => Linking.openURL(mark.attrs.href);
                            style.color = '#2980b9'; // Цвет ссылки
                            style.textDecorationLine = 'underline';
                        }
                        break;
                }
            });

            return (
                <Text key={index} style={style} onPress={onPress}>
                    {node.text}
                </Text>
            );
        }

        if (node.type === 'hardBreak') {
            return <Text key={index}>{'\n'}</Text>;
        }

        return null;
    };

    const renderContent = () => {
        const text = block.text;

        if (!text || typeof text !== 'string') {
            return null; // Или <Text>Пустой блок</Text>, если нужно что-то отобразить
        }

        if (isJsonString(text)) {
            try {
                const parsed = JSON.parse(text);
                return renderNode(parsed);
            } catch (e) {
                console.warn('Ошибка при парсинге JSON:', e);
                return <Text>{text}</Text>;
            }
        }

        return <Text>{text}</Text>;
    };

    return (
        <View
            style={[
                styles.block,
                styles.titleBlock,
                {alignItems: mapAlignToFlexAlign(block.align || 'left')},
            ]}
        >
            <Text
                style={[
                    styles.titleText,
                    {fontSize: block.size ? parseInt(block.size) * 4 + 12 : 20},
                ]}
            >
                {renderContent()}
            </Text>
        </View>
    );
};

const PdfBlock: React.FC<{ block: Block }> = ({block}) => {
    const [url, setUrlState] = useState<string | null>(null);
    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };
        fetchUrl();
    }, []);

    const openLink = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(err => Alert.alert('Ошибка', `Не удалось открыть ссылку. Адрес ссылки: ${url}`));
        }
    };

    return (
        <>
            {block?.lessonFileMedia && (
                <View style={{flex: 1}}>
                    {Platform.OS === 'ios' && <WebView
                        originWhitelist={['*']}
                        source={{uri: `${url}/${block?.lessonFileMedia?.path}`}}
                        style={{width: '100%', height: 240}}
                        //  onLoadEnd={() => handleLoadComplete(totalPages)} // Передайте общее количество страниц
                    />}

                    <TouchableOpacity
                        onPress={() => openLink(`${url}/${block?.lessonFileMedia?.path}`)}
                        style={GlobalStyle.btnOpenFile}>
                        <Text>
                            Открыть файл PDF
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    )
};

const VideosBlock: React.FC<VideosBlockProps> = ({videos, url}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeVideo = videos[activeIndex];
    const lesson = useAppSelector(state => state.lesson.data);

    if (videos.length === 0) {
        return null
    }

    const renderVideo = (video?: MaterialItem) => {
        if (!video) return null;

        if (video.link?.includes('youtu')) {
            const videoId = extractYouTubeId(video.link);
            if (!videoId) return null;

            return (
                <YoutubePlayer
                    key={`youtube-player-${videoId}`}
                    height={Platform.OS === 'ios' ? 250 : 220}
                    webViewStyle={{ borderRadius: 10, marginBottom: 10 }}
                    videoId={videoId}
                />
            );
        }

        if (video.link?.includes('rutube')) {
            return (
                <WebView
                    key={`rutube-player-${video.link}`}
                    style={styles.webView}
                    source={{ uri: video.link }}
                    mediaPlaybackRequiresUserAction={true}
                />
            );
        }

        if (video.media?.path) {
            const videoFileUrl = `${url}/${video.media.path}`;

            return (
                <WebView
                    key={`file-player-${videoFileUrl}`}
                    style={styles.webView}
                    source={{
                        html: `
                    <html>
                        <body style="margin:0;padding:0;overflow:hidden;">
                            <video 
                                width="100%" 
                                height="100%" 
                                controls 
                                controlsList="nodownload" 
                                style="border-radius:10px;">
                                <source src="${videoFileUrl}" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </body>
                    </html>
                    `,
                    }}
                    javaScriptEnabled={true}
                    mediaPlaybackRequiresUserAction={true}
                    allowsInlineMediaPlayback={false}
                />
            );
        }

        return null;
    };

    const extractYouTubeId = (url: string): string | null => {
        const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^\s&?/]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    return (
        <View style={styles.block}>


            {renderVideo(activeVideo)}
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>{lesson?.name}</Text>
            <View style={styles.buttonContainer}>
                {videos?.map((video, index) => {
                    const label = video.media?.name || video.name || `Видео ${index + 1}`;
                    const isActive = index === activeIndex;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.videoLinks, {backgroundColor: isActive ? '#edf7ff' : '#fff'}]}

                            //  style={[styles.button, isActive && styles.activeButton]}
                            onPress={() => setActiveIndex(index)}
                        >
                            <Text style={[styles.buttonText]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {/* Рейтинг урока */}
            <VideoRatingComponent videoId={+activeVideo?.id!}/>
        </View>
    );
};

const MaterialsBlock: React.FC<MaterialsBlockProps> = ({block}) => {
    const [url, setUrlState] = useState<string | null>(null);
    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };
        fetchUrl();
    }, []);

    return (
        <View key={block.id} style={styles.block}>
            <Text style={styles.blockTitle}>Полезные материалы:</Text>
            {block.lessonMaterials?.length ? (
                block.lessonMaterials.map((item, index) => {
                    if (item.media) {
                        return (
                            <Text key={`media-${index}`} style={styles.materialItem}>
                                📄{' '}
                                <Text
                                    style={styles.link}
                                    onPress={() => Linking.openURL(item.media!.path)}
                                >
                                    {item.media!.name}
                                </Text>
                            </Text>
                        );
                    } else if (item.link) {
                        return (
                            <Text key={`link-${index}`} style={styles.materialItem}>
                                🔗{' '}
                                <Text
                                    style={styles.link}
                                    onPress={() => Linking.openURL(item.link!)}
                                >
                                    {item.name || 'Ссылка'}
                                </Text>
                            </Text>
                        );
                    } else if (item.file) {
                        return (
                            <TouchableOpacity
                                style={{flex: 1}}
                                onPress={() => Linking.openURL(`${url}${item.file}`)}
                            >
                                <Text key={`file-${index}`} style={styles.materialItem}>
                                    📎{' '}
                                    <Text style={styles.link}>
                                        {item.name || 'Файл'}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        );
                    } else {
                        return null;
                    }
                })
            ) : (
                <Text>Нет доступных материалов.</Text>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonContainer: {
        gap: 5
    },
    videoLinks: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e7e7e8',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 7
    },
    image: {
        width: 200,
        height: 150,
        resizeMode: 'contain',
        marginRight: 10,
    },
    activeButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: Colors.colorBlack,
        fontSize: 16,
    },
    block: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    titleBlock: {
        backgroundColor: Colors.bgCard,
    },
    titleText: {
        fontWeight: 'bold',
        color: Colors.colorBlack,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
    },

    blockTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
    materialItem: {
        borderWidth: 1,
        borderColor: Colors.colorGreyNd,
        paddingHorizontal: 15,
        paddingVertical: 10,
        // marginHorizontal: 5,
        backgroundColor: '#f1e6f6',
        borderRadius: 8,
        marginBottom: 6,
        fontSize: 16,
    },
    link: {
        color: Colors.colorBlack,
        fontSize: 16
        //  textDecorationLine: 'underline',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
    item: {
        fontSize: 14,
        color: '#2980b9',
        textDecorationLine: 'underline',
        marginBottom: 4,
    },
    webView: {
        height: 250,
        borderRadius: 10,
        marginBottom: 10,
    },
});