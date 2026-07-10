import React from 'react';
import {
  Smile, Eye, Heart, Brain, Bone, Stethoscope,
  Baby, UserRound, Layers, Wind, FlaskConical,
} from 'lucide-react-native';

interface Props {
  kind: string;
  size?: number;
  color?: string;
}

export default function SpecialtyIcon({ kind, size = 26, color = '#1a7a73' }: Props) {
  const props = { size, color };
  switch (kind) {
    case 'tooth':        return <Smile {...props} />;
    case 'eye':          return <Eye {...props} />;
    case 'heart':        return <Heart {...props} />;
    case 'brain':        return <Brain {...props} />;
    case 'bone':         return <Bone {...props} />;
    case 'stethoscope':  return <Stethoscope {...props} />;
    case 'baby':         return <Baby {...props} />;
    case 'user-round':   return <UserRound {...props} />;
    case 'layers':       return <Layers {...props} />;
    case 'wind':         return <Wind {...props} />;
    case 'flask':        return <FlaskConical {...props} />;
    default:             return <Stethoscope {...props} />;
  }
}
