import {
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: Props) => {
  return (
    <>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete selected songs?</ModalHeader>
          <ModalBody>
            <HStack gap='4'>
              <Button
                onClick={() => {
                  onClose();
                  onConfirm();
                }}
                colorScheme='green'
                flex='1'
              >
                Delete
              </Button>
              <Button onClick={onClose} colorScheme='red' flex='1'>
                Cancel
              </Button>
            </HStack>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteConfirmModal;
