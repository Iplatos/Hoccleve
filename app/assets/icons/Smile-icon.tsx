import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface SmileIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function SmileIcon({focused, width = 24, height = 24}: SmileIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" id="smile" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16.001A8 8 0 0112 20zM7.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-.77 3.39a.9.9 0 01.27 1.25 4.78 4.78 0 01-7.94 0 .9.9 0 011.243-1.252.89.89 0 01.247.252 3 3 0 005 0 .89.89 0 011.18-.25z"
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











