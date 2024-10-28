import {
  Image,
  StyleSheet,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import UtxoFlow from "@/components/utxo-flow";
import { Colors } from "@/components/colors";

function clamp(value: number, min: number, max: number) {
  "worklet";

  return Math.min(Math.max(min, value), max);
}

export default function HomeScreen() {
  const topHeaderHeight = useHeaderHeight();
  const { width, height } = useWindowDimensions();
  const GRAPH_HEIGHT = height - topHeaderHeight + 20;
  const GRAPH_WIDTH = width;

  const canvasSize = { width: GRAPH_WIDTH * 1.5, height: GRAPH_HEIGHT }; // Reduced from 3 to 1.5
  const centerX = canvasSize.width / 3; // Changed from 4 to 3
  const centerY = canvasSize.height / 2;
  const sankeyWidth = canvasSize.width;
  const sankeyHeight = canvasSize.height - 200;

  // Add shared values for gestures
  const scale = useSharedValue(0.8); // Changed from 0.6 to 0.8
  const savedScale = useSharedValue(0.8);
  const translateX = useSharedValue(-width * 0.4); // Changed from 0.8 to 0.4
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(-width * 0.4);
  const savedTranslateY = useSharedValue(0);

  // Create gesture handlers
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, 0.5, 2);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[{ width: sankeyWidth, height: sankeyHeight }, animatedStyle]}
        >
          <UtxoFlow
            width={sankeyWidth}
            height={sankeyHeight}
            centerX={centerX}
            centerY={centerY}
            walletAddress={"1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71"}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[900],
  },
});
