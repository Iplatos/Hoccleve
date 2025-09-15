import * as React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop, SvgProps} from 'react-native-svg';

interface VideoTabIconProps extends SvgProps {
    focused?: boolean
}

export default function VideoTabIcon(props: VideoTabIconProps) {
    return (
        <Svg width="28" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <Path fill-rule="evenodd" clip-rule="evenodd"
                  d="M5.07772 12C5.07772 8.17693 8.17693 5.07772 12 5.07772C15.8231 5.07772 18.9223 8.17693 18.9223 12C18.9223 15.8231 15.8231 18.9223 12 18.9223C8.17693 18.9223 5.07772 15.8231 5.07772 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM9.88344 9.05678C9.58027 8.90519 9.22357 9.12565 9.22357 9.4646V14.5355C9.22357 14.8744 9.58027 15.0949 9.88344 14.9433L15.2509 12.2596C15.4647 12.1526 15.4647 11.8474 15.2509 11.7405L9.88344 9.05678ZM8.14585 9.4646C8.14585 8.32449 9.34566 7.58296 10.3654 8.09284L15.7329 10.7766C16.741 11.2807 16.7411 12.7194 15.7329 13.2235L10.3654 15.9072C9.34566 16.4171 8.14585 15.6756 8.14585 14.5355V9.4646Z"
                  fill={props.focused ? "url(#paint0_linear)" : "grey"}/>
            {
                props.focused && (
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

    )
}

