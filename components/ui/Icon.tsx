
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Icon: React.FC<IconProps> = ({ icon: IconComponent, ...props }) => {
  return <IconComponent {...props} />;
};

export default Icon;
