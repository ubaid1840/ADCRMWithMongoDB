import { Dimensions, View, TouchableOpacity, Text } from "react-native";
import { Svg, Circle } from "react-native-svg";
import Animated, {
    useAnimatedProps,
    withSpring,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";


const CustomProgressIndicator = () => {

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const progressCircle = useSharedValue(1);
    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: Circle_Length * progressCircle.value,
    }))

    useEffect(() => {
        progressCircle.value = withTiming(0, { duration: 2000 })
    }, [])

    const width = 200
    const height = 200
    const Circle_Length = 400;
    const Radius = Circle_Length / (2 * Math.PI);

    return (
        <>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", }}>
                <Svg>
                    <Circle
                        cx={width / 2}
                        cy={height / 2}
                        r={Radius}
                        stroke="#404258"
                        fill="#fff"
                        strokeWidth={35}
                    />
                    <AnimatedCircle
                        cx={width / 2}
                        cy={height / 2}
                        r={Radius}
                        stroke="#82CD47"
                        strokeWidth={15}
                        fill="transparent"
                        strokeDasharray={100}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                    />
                </Svg>
            </View>

        </>
    )
}
export default CustomProgressIndicator