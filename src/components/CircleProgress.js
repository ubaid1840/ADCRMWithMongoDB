import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import { View, Text, Animated, TextInput, StyleSheet } from 'react-native'
import Svg, { G, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const oceanBlueGradient = ['#00A8FF', '#0077B6'];
const sunnyOrangeGradient = ['#FFA500', '#FFC300'];
const purpleHazeGradient = ['#6A0572', '#490057'];
const tealDreamGradient = ['#03DAC6', '#018786'];
const berryBurstGradient = ['#D93A86', '#FF5A6D'];
const mintyFreshGradient = ['#00EAD3', '#00917C'];
const sunsetVibesGradient = ['#FFD54F', '#FF6D00'];
const roseGoldGradient = ['#EAB0D5', '#F7C1BB'];
const tropicalParadiseGradient = ['#56CCF2', '#2F80ED'];
const pastelDelightGradient = ['#FFD26F', '#3670FF'];

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export default function CircularProgressBar({
    percentage = 100,
    radius = 65,
    strokeWidth = 5,
    duration = 60000,
    color = 'tomato',
    colors = mintyFreshGradient,
    gradientAngle = 90,
    delay = 0,
    textColor = '#D93A86',
    max = 100

}) {
    const halfCircle = radius + strokeWidth
    const circleCircumference = 2 * Math.PI * radius
    const animatedValue = useRef(new Animated.Value(0)).current
    const [statusProgress, setStatusProgress] = useState(0)
    const [inputProgress, setInputProgress] = useState(0)

    const animation = (toValue) => {

        return Animated.timing(animatedValue, {
            toValue,
            duration,
            delay,
            useNativeDriver: false
        }).start(() => {
            if(toValue != 0){
                animatedValue.setValue(0);
                animation(100)
            }
            // animatedValue.current.value = 0
           
        //    animation(100)
        });
    }



    useLayoutEffect(() => {
        animation(percentage)
        animatedValue.addListener((v) => {
            const maxPercentage = 100 * v.value / max
            const strokeDashoffset = circleCircumference - (circleCircumference * maxPercentage) / 100
            setStatusProgress(strokeDashoffset)
            setInputProgress(v.value)
        })
        return () => {
            animatedValue.removeAllListeners()
        }
    }, [max, percentage])

    return (

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Svg
                width={radius * 2}
                height={radius * 2}
                viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
                style={{ transform: [{ rotate: '270deg' }], }}>
                <Defs>
                    <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${gradientAngle})`}>
                        {colors.map((color, index) => (
                            <Stop key={index} offset={`${index * (100 / (colors.length - 1))}%`} stopColor={color} />
                        ))}
                    </LinearGradient>
                </Defs>
                <G>
                    <Circle
                        cx='50%'
                        cy='50%'
                        stroke='#FFFFFF'
                        strokeWidth={strokeWidth}
                        r={radius}
                        strokeOpacity={0.2}
                        fill='transparent'
                    />

                    <AnimatedCircle
                        cx='50%'
                        cy='50%'
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        r={radius}
                        fill='transparent'
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={statusProgress}
                        strokeLinecap='round'
                    />

                </G>

            </Svg>
            {/* <TextInput
                editable={false}
                value={`${Math.round(inputProgress)}%`}
                style={[StyleSheet.absoluteFillObject, { fontSize: radius / 2, color: textColor ?? color }, { fontWeight: 'bold', textAlign: 'center', position:'absolute' }]}
            >
            </TextInput> */}
            <View style={{ flexDirection: 'row', position: 'absolute', }}>
            <Image style={{ height: 80, width: 80 }} source={require('../../assets/applogo.png')}></Image>
            </View>
        </View>
    )
}