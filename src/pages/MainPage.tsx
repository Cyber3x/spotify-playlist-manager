import { Box, Flex, Heading, Link, Spacer, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '~/components/Navbar';
import { initConnectToSpofity } from '~/utils/auth';

function MainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.localStorage.getItem('access_token')) {
      navigate('/connected');
    }
  }, []);

  return (
    <Flex textAlign={'center'} direction='column' height={'100vh'}>
      <Navbar onClick={initConnectToSpofity} buttonText='Connect Spotify' />
      <Heading color='whiteAlpha.800' my='10' size='xl'>
        Welcome to spofity playlist manager.
      </Heading>
      <Heading color={'whatsapp.500'} size='2xl'>
        Please connect your spotify.
      </Heading>
      <Text mt='10' color={'gray.400'} fontSize='lg'>
        For any bugs feel free to open a issue on{' '}
        <Link href='https://github.com/Cyber3x'>GitHub</Link> or send me a
        message.
      </Text>
      <Spacer />
      <Text mb='5' color='gray.400'>
        Made by <Link href='https://github.com/Cyber3x'>Cyber3x</Link>, 2022
      </Text>
    </Flex>
  );
}

export default MainPage;
