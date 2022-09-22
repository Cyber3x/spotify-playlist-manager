import {
  Box,
  Checkbox,
  Flex,
  Image,
  Link,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

interface Props {
  track: SpotifyApi.TrackObjectFull;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
}

const TrackCard = ({ selectable, track, onClick, selected }: Props) => {
  const handleOnClick = () => {
    if (onClick) onClick();
  };

  return (
    <Box
      my='2'
      py='1.5'
      px='4'
      bg='blackAlpha.400'
      rounded={'md'}
      shadow='lg'
      onClick={handleOnClick}
    >
      <Flex alignItems={'center'}>
        {selectable && (
          <Checkbox
            pointerEvents={'none'}
            mr='4'
            size={'lg'}
            colorScheme='whatsapp'
            isChecked={selected}
            onChange={handleOnClick}
          />
        )}
        <Image src={track.album.images[2].url} boxSize='40px' />
        <Box ml='4'>
          <Link
            color='white'
            href={track.external_urls.spotify}
            isExternal
            onClick={(e) => e.stopPropagation()}
          >
            {track.name}
          </Link>
          <Wrap spacing={'1'}>
            {track.artists.map((artist, i) => (
              <WrapItem key={artist.id}>
                <Link
                  href={artist.external_urls.spotify}
                  isExternal
                  color='whiteAlpha.600'
                  onClick={(e) => e.stopPropagation()}
                >
                  {artist.name}
                  {i !== track.artists.length - 1 ? ',' : ''}
                </Link>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </Flex>
    </Box>
  );
};

export default TrackCard;
