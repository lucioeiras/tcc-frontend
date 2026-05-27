import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { usePathname } from 'expo-router';
import {
  StarsOutline,
  StarsBold,
  DocumentTextOutline,
  DocumentTextBold,
} from '@solar-icons/react-native';

import { Tab } from './Tab';

export default function CustomTabBar(props: BottomTabBarProps) {
  const pathname = usePathname();

  const { width } = useWindowDimensions();
  const CONTAINER_PADDING = 8;
  const TAB_BAR_WIDTH = width - 80;
  const TAB_WIDTH = (TAB_BAR_WIDTH - CONTAINER_PADDING * 2) / 2;

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(pathname === '/resume' ? 0 : TAB_WIDTH, {
            duration: 250,
          }),
        },
      ],
    };
  });

  return (
    <View className="pointer-events-box-none absolute right-0 bottom-8 left-0 items-center justify-center bg-transparent">
      <View
        className="relative flex-row rounded-full bg-white shadow-2xl shadow-black"
        style={{ width: TAB_BAR_WIDTH, padding: CONTAINER_PADDING }}>
        <Animated.View
          className="absolute top-2 bottom-2 left-2 rounded-full bg-gray-100"
          style={[{ width: TAB_WIDTH }, animatedBackgroundStyle]}
        />

        <Tab
          name="Resumo"
          path="./resume"
          ActiveIcon={DocumentTextBold}
          InactiveIcon={DocumentTextOutline}
        />

        <Tab
          name="Assistente"
          path="./assistant"
          ActiveIcon={StarsBold}
          InactiveIcon={StarsOutline}
        />
      </View>
    </View>
  );
}
