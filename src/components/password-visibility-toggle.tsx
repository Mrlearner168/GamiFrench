import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type PasswordVisibilityToggleProps = {
  /** True when the password is currently revealed. Drives the icon. */
  visible: boolean;
  onPress: () => void;
  disabled?: boolean;
};

const ICON_SIZE = 22;

const EYE_PATH =
  'M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z';
const EYE_OFF_PATH =
  'M17.94 17.94A10.4 10.4 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.3 9.3 0 0 1 12 4c7 0 11 8 11 8a18.7 18.7 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24';
const SLASH_PATH = 'M1.5 1.5l21 21';

/**
 * Toggles a password field between masked and plain text.
 *
 * Shared by the login and register screens so the reveal control looks and
 * behaves identically on both.
 */
function PasswordVisibilityToggleComponent({
  visible,
  onPress,
  disabled = false,
}: PasswordVisibilityToggleProps) {
  const label = visible ? 'Hide password' : 'Show password';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: visible }}
      hitSlop={10}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Svg
        width={ICON_SIZE}
        height={ICON_SIZE}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#647084"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d={visible ? EYE_OFF_PATH : EYE_PATH} />
        {visible ? null : <Circle cx={12} cy={12} r={3} />}
        {visible ? <Path d={SLASH_PATH} /> : null}
      </Svg>
    </Pressable>
  );
}

export const PasswordVisibilityToggle = memo(PasswordVisibilityToggleComponent);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingLeft: 12,
    marginRight: -8,
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
});