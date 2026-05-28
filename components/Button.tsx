import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  View,
} from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome6';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'naked' | 'disabled';
  width?: 'fill' | 'hug';
  styles?: string;
  icon?: typeof FontAwesome;
  iconOrientation?: 'vertical' | 'horizontal';
}

export const Button = ({
  title,
  type,
  width = 'hug',
  icon,
  iconOrientation = 'horizontal',
  ...props
}: ButtonProps) => {
  const buttonStyles = {
    primary: 'bg-purple-600',
    secondary: 'bg-white border-1 border-purple-300',
    tertiary: 'bg-white border-1 border-slate-300',
    naked: 'bg-transparent',
    disabled: 'bg-gray-100',
  };

  const textStyles = {
    primary: 'text-lg text-white',
    secondary: 'text-lg text-purple-800',
    tertiary: 'text-lg text-slate-800',
    naked: 'text-base text-purple-800',
    disabled: 'text-lg text-gray-500',
  };

  const widthStyles = {
    fill: ' w-full flex items-center justify-center',
    hug: ' inline-flex',
  };

  const iconOrientationStyles = {
    vertical: ' flex-col',
    horizontal: ' flex-row',
  };

  const paddingStyle = title ? ' px-8 py-4' : ' p-3';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      className={
        buttonStyles[type] +
        widthStyles[width] +
        iconOrientationStyles[iconOrientation] +
        paddingStyle +
        ' rounded-full font-manrope-semibold'
      }
      {...props}
    >
      {icon && (
        <View
          className={
            title && (iconOrientation === 'horizontal' ? 'mr-4' : 'mb-2')
          }
        >
          {icon}
        </View>
      )}
      {title && <Text className={textStyles[type]}>{title}</Text>}
    </TouchableOpacity>
  );
};
