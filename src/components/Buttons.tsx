import { Button, Flex, Tooltip } from '@chakra-ui/react';

interface Props {
  onDeleteClick: () => void;
  onMoveClick: () => void;
  onCopyClick: () => void;
  deleteDisabled?: boolean;
  moveDisabled?: boolean;
  copyDisabled?: boolean;
  userOwnsSource?: boolean;
  [key: string]: any;
}

const Buttons = ({
  onDeleteClick,
  onMoveClick,
  onCopyClick,
  deleteDisabled,
  moveDisabled,
  copyDisabled,
  userOwnsSource,
  ...rest
}: Props) => {
  return (
    <Flex gap={4} justifyContent={'space-between'} {...rest}>
      <Button
        colorScheme={'red'}
        flex='1'
        onClick={onDeleteClick}
        disabled={deleteDisabled}
      >
        Delete selected songs
      </Button>

      <Button
        flex={1}
        colorScheme={'whatsapp'}
        onClick={onMoveClick}
        disabled={moveDisabled}
      >
        Move
      </Button>
      <Button
        colorScheme={'yellow'}
        flex='1'
        onClick={onCopyClick}
        disabled={copyDisabled}
      >
        Copy
      </Button>
    </Flex>
  );
};

export default Buttons;
