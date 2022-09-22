import { Text } from '@chakra-ui/react';

interface Props {
  onClick: () => void;
  name: string;
  selected?: boolean;
  selectedColor?: string;
}

const PlaylistItem = ({ onClick, selected, name, selectedColor }: Props) => {
  return (
    <Text
      onClick={onClick}
      color={!selected ? 'whiteAlpha.700' : selectedColor}
      _hover={{ color: 'white' }}
      py='1.5'
      _first={{
        pt: '0',
      }}
    >
      {name}
    </Text>
  );
};

export default PlaylistItem;
