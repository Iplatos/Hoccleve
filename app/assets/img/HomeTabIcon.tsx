import React from 'react';
import {Svg, Path, Defs, LinearGradient, Stop, SvgProps} from 'react-native-svg';

interface HomeTabIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function HomeTabIcon({focused = true, width = 34, height = 34}:HomeTabIconProps ) {
    return (
        <Svg width={width} height={height} viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.7836 5.83454C21.4504 5.86094 22.026 6.30972 22.2143 6.94992L26.1031 20.1718C26.3455 20.996 25.8739 21.8606 25.0497 22.103C24.2255 22.3454 23.3609 21.8738 23.1185 21.0496L20.5296 12.2475L17.1195 21.1663C16.8923 21.7606 16.3259 22.1567 15.6896 22.1661C15.0533 22.1755 14.4755 21.7964 14.2308 21.209L11.7778 15.322L9.32491 21.209C9.09613 21.7581 8.57426 22.1286 7.98047 22.1636C7.38667 22.1985 6.82493 21.8918 6.53331 21.3733L3.03342 15.1513C2.61224 14.4025 2.8778 13.4541 3.62655 13.0329C4.37531 12.6117 5.32373 12.8773 5.7449 13.6261L7.68045 17.067L10.342 10.6794C10.5835 10.0997 11.1499 9.72211 11.7778 9.72211C12.4058 9.72211 12.9722 10.0997 13.2137 10.6794L15.6046 16.4175L19.2691 6.8333C19.5074 6.20999 20.1168 5.80814 20.7836 5.83454Z"
                fill={focused ? "url(#paint0_linear)" : "grey"}
            />
            {
                focused && (
                    <Defs>
                        <LinearGradient
                            id="paint0_linear"
                            x1="27.3327"
                            y1="17.4997"
                            x2="-2.61092"
                            y2="12.8332"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop stopColor="#9828D3"/>
                            <Stop offset="1" stopColor="#ED6B6A"/>
                        </LinearGradient>
                    </Defs>
                )
            }
        </Svg>
    );
}


