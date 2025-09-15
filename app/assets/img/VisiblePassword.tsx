import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

export default function VisiblePassword(props) {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <Path fillRule="evenodd" clipRule="evenodd"
                  d="M19 14C19 14.5523 19.4477 15 20 15C20.5523 15 21 14.5523 21 14C21 9.02944 16.9706 5 12 5C7.02944 5 3 9.02944 3 14C3 14.5523 3.44772 15 4 15C4.55229 15 5 14.5523 5 14C5 10.134 8.13401 7 12 7C15.866 7 19 10.134 19 14ZM12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
                  fill={props ? props.color : "#64748B"} />
        </Svg>
    )
}


