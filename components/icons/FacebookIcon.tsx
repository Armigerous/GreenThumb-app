import React from "react";
import Svg, { Path } from "react-native-svg";

interface FacebookIconProps {
  size?: number;
  color?: string;
}

export const FacebookIcon: React.FC<FacebookIconProps> = ({
  size = 24,
  color = "black",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.833 22V13.2H6.669V9.6H9.833V6.849C9.833 3.726 11.694 2 14.541 2C15.4757 2.01295 16.4082 2.09417 17.331 2.243V5.311H15.76C15.4921 5.27507 15.2196 5.29992 14.9626 5.38371C14.7057 5.4675 14.4709 5.60808 14.2757 5.79502C14.0805 5.98195 13.9299 6.21044 13.8351 6.46354C13.7403 6.71663 13.7037 6.98783 13.728 7.257V9.6H17.185L16.633 13.2H13.733V22H9.833Z"
        fill={color}
      />
    </Svg>
  );
};

export default FacebookIcon;
