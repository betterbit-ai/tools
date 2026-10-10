import { useState } from 'preact/hooks';
import { Panel } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';

export default function TextDiff({ ui }: ToolProps<UI>) {
  const [value] = useState('');
  // TODO: build the UI only from src/components/ui primitives and design tokens.
  return <Panel>{ui.example}{value}</Panel>;
}
