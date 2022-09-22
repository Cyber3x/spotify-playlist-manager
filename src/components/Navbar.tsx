import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Spacer,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

interface Props {
  onClick: () => void;
  buttonText: string;
  displayName?: string;
}

const Navbar = ({ onClick, buttonText, displayName }: Props) => {
  return (
    <Box bg='gray.600' p='4'>
      <Flex alignItems={'center'} gap='8'>
        <Link
          to={window.localStorage.getItem('access_token') ? '/connected' : '/'}
        >
          <Heading color={'whiteAlpha.800'} size='lg'>
            Spotify playlist manager
          </Heading>
        </Link>
        <Spacer />
        {displayName && <Heading size='md'>Hello, {displayName}</Heading>}
        <ButtonGroup gap='2'>
          <Button px='8' bgColor={'gray.500'} onClick={onClick}>
            {buttonText}
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};

export default Navbar;
