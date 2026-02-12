import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useAppStore } from '../store';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

// Canvas-based Noise Overlay Component using WebView
const NoiseOverlay = () => {
    const noiseHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                * { margin: 0; padding: 0; }
                body { background: transparent; overflow: hidden; }
                canvas { 
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    width: 100vw; 
                    height: 100vh;
                    image-rendering: pixelated;
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            <canvas id="noise"></canvas>
            <script>
                const canvas = document.getElementById('noise');
                const ctx = canvas.getContext('2d', { alpha: true });
                const size = 512;
                canvas.width = size;
                canvas.height = size;
                
                let frame = 0;
                const refreshInterval = 3;
                const alpha = 4; // Reduced opacity to be barely noticeable
                
                function drawNoise() {
                    const imageData = ctx.createImageData(size, size);
                    const data = imageData.data;
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const value = Math.random() * 255;
                        data[i] = value;
                        data[i + 1] = value;
                        data[i + 2] = value;
                        data[i + 3] = alpha;
                    }
                    
                    ctx.putImageData(imageData, 0, 0);
                }
                
                function loop() {
                    if (frame % refreshInterval === 0) {
                        drawNoise();
                    }
                    frame++;
                    requestAnimationFrame(loop);
                }
                
                loop();
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.noiseContainer} pointerEvents="none">
            <WebView
                source={{ html: noiseHTML }}
                style={styles.noiseWebView}
                scrollEnabled={false}
                pointerEvents="none"
                backgroundColor="transparent"
                originWhitelist={['*']}
            />
        </View>
    );
};

import Svg, { Defs, RadialGradient, Stop, Circle, Rect } from 'react-native-svg';

// ... (existing imports)

// Animated Orb Component for morphing gradient effect
const AnimatedOrb = ({ color, size, initialX, initialY, duration }: {
    color: string;
    size: number;
    initialX: number;
    initialY: number;
    duration: number;
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.6)).current; // Lower base opacity for subtle blend

    useEffect(() => {
        // Continuous organic movement
        const animatePosition = () => {
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: Math.random() * 200 - 100,
                    duration: duration * (0.8 + Math.random() * 0.4),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: Math.random() * 150 - 75,
                    duration: duration * (0.8 + Math.random() * 0.4),
                    useNativeDriver: true,
                })
            ]).start(() => animatePosition());
        };

        // Gentle breathing for scale
        const animateScale = () => {
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.4,
                    duration: duration * 1.5,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1.0,
                    duration: duration * 1.5,
                    useNativeDriver: true,
                })
            ]).start(() => animateScale());
        };

        // Subtle opacity pulsing
        const animateOpacity = () => {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.8,
                    duration: duration,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.4,
                    duration: duration,
                    useNativeDriver: true,
                })
            ]).start(() => animateOpacity());
        };

        animatePosition();
        animateScale();
        animateOpacity();
    }, []);

    // Create a unique ID for the gradient to prevent collisions
    const gradientId = `grad-${color}-${initialX}`;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: initialX,
                top: initialY,
                width: size,
                height: size,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
            }}
        >
            <Svg height="100%" width="100%" viewBox="0 0 100 100">
                <Defs>
                    <RadialGradient
                        id={gradientId}
                        cx="50%"
                        cy="50%"
                        rx="50%"
                        ry="50%"
                        fx="50%"
                        fy="50%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
                        <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
            </Svg>
        </Animated.View>
    );
};

// Card Component for Create Options
const CreateCard = ({
    title,
    subtitle,
    icon,
    onPress,
    colors,
    delay = 0,
    disabled = false,
    style,
    iconSize = 28
}: {
    title: string;
    subtitle: string;
    icon: any;
    onPress: () => void;
    colors: readonly [string, string, ...string[]];
    delay?: number;
    disabled?: boolean;
    style?: any;
    iconSize?: number;
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                })
            ])
        ]).start();
    }, []);

    return (
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                style={[styles.createCard, StyleSheet.absoluteFill, disabled && { opacity: 0.6 }]}
            >
                <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                    colors={colors}
                    style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                <View style={styles.createCardContent}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                        <Ionicons name={icon} size={iconSize} color="white" />
                    </View>
                    <View>
                        <Text style={styles.createCardTitle}>{title}</Text>
                        <Text style={styles.createCardSubtitle}>{subtitle}</Text>
                    </View>
                </View>

                {disabled && (
                    <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>SOON</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export const ComposerEntryScreen = () => {
    const navigation = useNavigation<any>();
    const drafts = useAppStore(state => state.drafts);
    const fetchDrafts = useAppStore(state => state.fetchDrafts);
    const currentUser = useAppStore(state => state.currentUser);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDrafts();
        });
        return unsubscribe;
    }, [navigation]);

    const [activeTab, setActiveTab] = React.useState<'Drafts' | 'Collabs'>('Drafts');
    const [useUnityEngine, setUseUnityEngine] = React.useState(false);

    // Filter drafts into solo drafts and collabs based on collaborators
    const { myDrafts, collabs } = useMemo(() => {
        const currentUserId = currentUser?.id;

        // Collabs = drafts that have collaborators (regardless of ownership)
        const collabDrafts = drafts.filter(d => {
            const hasCollaborators = (d.collaborators?.length || 0) > 0;
            return hasCollaborators;
        });

        // My drafts = drafts I own with no collaborators (solo work)
        const soloOwned = drafts.filter(d =>
            d.ownerId === currentUserId && (d.collaborators?.length || 0) === 0
        );

        return { myDrafts: soloOwned, collabs: collabDrafts };
    }, [drafts, currentUser?.id]);

    const currentData = activeTab === 'Drafts' ? myDrafts : collabs;

    const loadDraft = useAppStore(state => state.loadDraft);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleDraftPress = async (item: any) => {
        if (isLoading) return;

        let draftData = item.sceneData;

        // Lazy load if missing and we have a sceneId
        if (!draftData && item.sceneId) {
            try {
                setIsLoading(true);
                await loadDraft(item);
                const updatedDraft = useAppStore.getState().draftPost;
                draftData = updatedDraft?.sceneData;
            } catch (e) {
                console.error("Failed to load draft", e);
            } finally {
                setIsLoading(false);
            }
        }

        // Safety check - provide fallback empty scene if no data
        if (!draftData) {
            console.warn('[ComposerEntry] No sceneData for draft, using empty scene');
            draftData = { objects: [], sceneType: 'figment_ar' };
        }

        // Navigate to Figment AR editor with draft data
        navigation.navigate('Figment', {
            draftData: draftData,
            draftTitle: item.title || "Untitled",
            draftId: item.id
        });
    };

    const renderDraft = ({ item }: { item: any }) => {
        // coverImage is now a proper R2 URL from fetchDrafts (mapped from previewPath)
        const imageUrl = item.coverImage;

        return (
            <TouchableOpacity
                style={[styles.draftCard, isLoading && { opacity: 0.7 }]}
                onPress={() => handleDraftPress(item)}
                disabled={isLoading}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={[styles.draftPreview, { marginBottom: 8 }]} />
                ) : (
                    <View style={styles.draftPreview} />
                )}
                <Text style={styles.draftTitle} numberOfLines={1}>{item.title || "Untitled"}</Text>
                <Text style={styles.draftDate}>{new Date(item.updatedAt || Date.now()).toLocaleDateString()}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Base dark gradient */}
            <LinearGradient
                colors={['#000000', '#050510', '#000000']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Animated morphing orbs - Huge sizes for atmospheric blending */}
            <View style={[styles.orbContainer, { opacity: 0.9 }]} pointerEvents="none">
                <AnimatedOrb color="#ff0080" size={500} initialX={width * -0.2} initialY={height * 0.05} duration={4000} />
                <AnimatedOrb color="#00d4ff" size={450} initialX={width * 0.5} initialY={height * 0.3} duration={5000} />
                <AnimatedOrb color="#aa00ff" size={550} initialX={width * 0.2} initialY={height * -0.1} duration={3500} />
            </View>

            {/* Darkening Overlay for "Deep Space" feel */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} pointerEvents="none" />

            {/* Double Dark Blur for Maximum Atmosphere "fog" */}
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} pointerEvents="none" />
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} pointerEvents="none" />

            {/* Canvas-based noise overlay */}
            <NoiseOverlay />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    {/* Minimal Header */}
                    <View style={{ width: 40 }} />
                </View>

                {/* Hero Title - "Create Something" */}
                <View style={styles.heroContainer}>
                    <Text style={styles.heroText}>Create{'\n'}Something.</Text>
                </View>

                {/* Main Content ScrollView */}
                <View style={styles.content}>

                    {/* Create Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionHeader}>Create</Text>
                        <View style={styles.bentoGrid}>
                            {/* Primary Card: Studio */}
                            <CreateCard
                                title="Studio"
                                subtitle={useUnityEngine ? 'Unity AR Engine' : 'Quick AR Scenes'}
                                icon="layers-outline"
                                colors={useUnityEngine ? ['rgba(0,223,216,0.4)', 'rgba(0,124,240,0.4)'] : ['rgba(255,0,128,0.4)', 'rgba(121,40,202,0.4)']}
                                onPress={() => navigation.navigate('Figment', { useUnity: useUnityEngine })}
                                delay={0}
                                style={styles.bentoPrimary}
                                iconSize={32}
                            />

                            <View style={styles.bentoRow}>
                                {/* Secondary: Pro — Toggles Unity engine on/off */}
                                <CreateCard
                                    title={useUnityEngine ? 'Pro ✦ ON' : 'Pro'}
                                    subtitle={useUnityEngine ? 'Unity Engine Active' : 'Toggle Unity Engine'}
                                    icon={useUnityEngine ? 'flash' : 'flash-outline'}
                                    colors={useUnityEngine ? ['rgba(0,255,180,0.4)', 'rgba(0,200,255,0.4)'] : ['rgba(0,223,216,0.3)', 'rgba(0,124,240,0.3)']}
                                    onPress={() => setUseUnityEngine(!useUnityEngine)}
                                {/* Secondary: Voice */}
                                <CreateCard
                                    title="Voice"
                                    subtitle="Speak to Create"
                                    icon="mic-outline"
                                    colors={['rgba(0,223,216,0.3)', 'rgba(0,124,240,0.3)']}
                                    onPress={() => navigation.navigate('AdvancedComposer')}
                                    delay={100}
                                    style={styles.bentoSecondary}
                                />

                                {/* Secondary: Hologram */}
                                <CreateCard
                                    title="Hologram"
                                    subtitle="AR Selfie Effects"
                                    icon="body-outline"
                                    colors={['rgba(0,212,255,0.3)', 'rgba(123,97,255,0.3)']}
                                    onPress={() => navigation.navigate('Hologram')}
                                    delay={200}
                                    style={styles.bentoSecondary}
                                />
                            </View>

                            <View style={styles.bentoRow}>
                                {/* Tertiary: Pro */}
                                <CreateCard
                                    title="Pro"
                                    subtitle="Unity Editor"
                                    icon="prism-outline"
                                    colors={['rgba(255,77,77,0.3)', 'rgba(249,203,40,0.3)']}
                                    onPress={() => navigation.navigate('UnityTestScene')}
                                    delay={300}
                                    style={styles.bentoSecondary}
                                />

                                {/* Placeholder for balance */}
                                <View style={styles.bentoSecondary} />
                            </View>
                        </View>
                    </View>

                    {/* Recents Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.tabsHeader}>
                            <Text style={styles.sectionHeader}>Recents</Text>
                            <View style={styles.tabs}>
                                <TouchableOpacity onPress={() => setActiveTab('Drafts')}>
                                    <Text style={activeTab === 'Drafts' ? styles.activeTab : styles.inactiveTab}>Drafts</Text>
                                </TouchableOpacity>
                                <View style={styles.tabDivider} />
                                <TouchableOpacity onPress={() => setActiveTab('Collabs')}>
                                    <Text style={activeTab === 'Collabs' ? styles.activeTab : styles.inactiveTab}>Collabs</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ height: 200, marginTop: 16 }}>
                            {currentData.length > 0 ? (
                                <FlatList
                                    horizontal
                                    data={currentData}
                                    renderItem={renderDraft}
                                    keyExtractor={item => item.id}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 40 }}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>No {activeTab.toLowerCase()} found</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    orbContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    noiseWebView: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    noiseContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroContainer: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },
    heroText: {
        fontSize: 40,
        fontWeight: '700',
        color: 'white',
        letterSpacing: -0.5,
        lineHeight: 44,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    content: {
        flex: 1,
        paddingBottom: 20,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 24,
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    bentoGrid: {
        paddingHorizontal: 20,
        gap: 12,
    },
    bentoRow: {
        flexDirection: 'row',
        gap: 12,
    },
    bentoPrimary: {
        width: '100%',
        height: 140, // Large top card
    },
    bentoSecondary: {
        flex: 1,
        height: 120, // Smaller bottom cards
    },
    createCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(10,10,15,0.6)', // Deeper dark for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    createCardContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    createCardTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    createCardSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '500',
    },
    comingSoonBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    comingSoonText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '700',
    },
    tabsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 24,
    },
    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    tabDivider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4,
    },
    activeTab: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    inactiveTab: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    draftCard: {
        width: 140,
        height: 180,
        marginRight: 16,
        justifyContent: 'flex-start', // Align to top since no container
    },
    draftPreview: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        marginBottom: 10,
        width: '100%',
    },
    draftTitle: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 2,
    },
    draftDate: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginHorizontal: 20,
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyStateText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '500',
    },
});
