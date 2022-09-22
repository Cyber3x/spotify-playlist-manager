import { Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

const ReroutPage = () => {
  const navigate = useNavigate();
  let code: string | null;

  useEffect(() => {
    const args = new URLSearchParams(window.location.search);
    code = args.get('code');
    // const error = args.get('error');

    if (code !== null && code !== '') {
      getToken(code, navigate);
    } else {
      navigate('/');
    }
  }, []);

  return (
    <Text color={'white'} p='4'>
      Loading... If you get stuck here, reload or go to the landing page. Sorry
      xD
    </Text>
  );
};

export default ReroutPage;
