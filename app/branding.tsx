import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function BrandingScreen() {
    const router = useRouter();

    const brandOpacity = useSharedValue(0);
    const brandScale = useSharedValue(0.96);
    const taglineOpacity = useSharedValue(0);
    const taglineTranslateY = useSharedValue(10);

    useEffect(() => {
        brandOpacity.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });

        brandScale.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });

        taglineOpacity.value = withDelay(
            800,
            withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
        );

        taglineTranslateY.value = withDelay(
            800,
            withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) })
        );

        const timer = setTimeout(() => {
            router.replace("/(tabs)");
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const brandAnimatedStyle = useAnimatedStyle(() => ({
        opacity: brandOpacity.value,
        transform: [{ scale: brandScale.value }],
    }));

    const taglineAnimatedStyle = useAnimatedStyle(() => ({
        opacity: taglineOpacity.value,
        transform: [{ translateY: taglineTranslateY.value }],
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#f8fafc", "#eef2f7", "#e2e8f0"]}
                style={styles.gradient}
            >
                <View style={styles.contentWrapper}>
                    <Animated.View style={brandAnimatedStyle}>
                        <Text style={styles.brandText}>
                            Balwa Car Cool
                        </Text>
                    </Animated.View>

                    <Animated.View style={taglineAnimatedStyle}>
                        <Text style={styles.taglineText}>
                            Designed & Maintained by PrimeVex Technologies
                        </Text>
                    </Animated.View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    gradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentWrapper: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    brandText: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0f172a",
        letterSpacing: -0.3,
        marginBottom: 10,
        textAlign: "center",
    },
    taglineText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#64748b",
        letterSpacing: 0.5,
        textAlign: "center",
    },
});