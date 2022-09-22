import {
  Box,
  Center,
  Container,
  Flex,
  Heading,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Buttons from '~/components/Buttons';
import DeleteConfirmModal from '~/components/DeleteConfirmModal';
import Navbar from '~/components/Navbar';
import PlaylistItem from '~/components/PlaylistItem';
import PlaylistTracks from '~/components/PlaylistTracks';
import { logout, refreshToken } from '~/utils/auth';

function ConnectedPage() {
  const navigate = useNavigate();
  const toast = useToast();
  let access_token: string | null;
  const [accessTokenSaved, setAccessTokenSaved] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<SpotifyApi.UserObjectPublic>();
  const [usersPlaylists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);

  const [sourcePlaylist, setSourcePlaylist] =
    useState<SpotifyApi.PlaylistObjectSimplified>();
  const [sourcePlaylistTracks, setSourcePlaylistTracks] = useState<
    SpotifyApi.TrackObjectFull[]
  >([]);
  const [sourcePlaylistLoading, setSourcePlaylistLoading] =
    useState<boolean>(false);

  const [destinationPlaylist, setDestinationPlaylist] =
    useState<SpotifyApi.PlaylistObjectSimplified>();
  const [destinationPlaylistTracks, setDestinationPlaylistTracks] = useState<
    SpotifyApi.TrackObjectFull[]
  >([]);
  const [destinationPlaylistLoading, setDestinationPlaylistLoading] =
    useState<boolean>(false);

  const [likedTracksStatus, setLikedTracksStatus] = useState<'S' | 'D' | 'N'>(
    'N'
  );

  // ON MOUNT
  useEffect(() => {
    access_token = window.localStorage.getItem('access_token');

    if (access_token) {
      setAccessTokenSaved(access_token);
      fetchUserProfile(); // here the token is tested, if expired try to refresh
      fetchUsersPlaylists();
    } else {
      logout(navigate);
    }
  }, []);

  const fetchSourcePlaylistTracks = () => {
    if (sourcePlaylist) {
      setSourcePlaylistLoading(true);
      fetchPlaylistTracks(sourcePlaylist.id).then((tracks) => {
        setSourcePlaylistTracks(tracks);
        setSourcePlaylistLoading(false);
      });
    } else if (likedTracksStatus === 'S') {
      fetchLikedTracks('S');
    } else {
      console.log('source playlist is null');
    }
  };

  // ON SOURCE PLAYLIST CHANGE
  useEffect(() => {
    fetchSourcePlaylistTracks();
    setSelectedTracks([]);
  }, [sourcePlaylist]);

  const fetchDestinationPlaylistTracks = () => {
    if (destinationPlaylist) {
      setDestinationPlaylistLoading(true);

      fetchPlaylistTracks(destinationPlaylist.id).then((tracks) => {
        setDestinationPlaylistTracks(tracks);
        setDestinationPlaylistLoading(false);
      });
    } else if (likedTracksStatus === 'D') {
      fetchLikedTracks('D');
    } else {
      console.log('destination playlist is null');
    }
  };

  // ON DESTINATION PLAYLIST CHANGE
  useEffect(() => fetchDestinationPlaylistTracks(), [destinationPlaylist]);

  const fetchUserProfile = async () => {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      refreshToken(navigate); // token is inspired
    } else if (response.status !== 200) {
      logout(navigate); // token is invalid
    } else {
      // token is valid
      const responseData: SpotifyApi.CurrentUsersProfileResponse =
        await response.json();
      setCurrentUser(responseData);
    }
  };

  const fetchUsersPlaylists = async () => {
    const response = await fetch(
      'https://api.spotify.com/v1/me/playlists?limit=50',
      {
        headers: {
          Authorization: 'Bearer ' + access_token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) refreshToken(navigate);

    const responseData: SpotifyApi.ListOfCurrentUsersPlaylistsResponse =
      await response.json();
    setPlaylists(responseData.items);
  };

  const fetchLikedTracks = async (destination: 'S' | 'D') => {
    const response = await fetch(
      'https://api.spotify.com/v1/me/tracks?limit=50',
      {
        headers: {
          Authorization: 'Bearer ' + accessTokenSaved,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData: SpotifyApi.UsersSavedTracksResponse =
      await response.json();
    const tracks = responseData.items.map((item) => item.track);
    if (destination === 'S') {
      setSourcePlaylistTracks(tracks);
    } else {
      setDestinationPlaylistTracks(tracks);
    }
    // console.log(responseData);
  };

  const fetchPlaylistTracks = async (
    id: string
  ): Promise<SpotifyApi.TrackObjectFull[]> => {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${id}/tracks?limit=50`,
      {
        headers: {
          Authorization: 'Bearer ' + accessTokenSaved,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData: SpotifyApi.PlaylistTrackResponse =
      await response.json();

    let _tracks = responseData.items.map((item) => item.track);
    let tracks: SpotifyApi.TrackObjectFull[] = [];
    _tracks.forEach((track) => {
      if (track) tracks.push(track);
    });
    return tracks;
  };

  const displayErrorToast = (title: string) => {
    toast({
      title: title,
      status: 'error',
      position: 'top',
      isClosable: true,
    });
  };

  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [uniqueSelectedTracks, setUniqueSelectedTracks] = useState<string[]>(
    []
  );

  // REMOVE DUPLICATE SONGS SO WE DONT ADD THEM TO THE DESTINATION AGAIN
  useEffect(() => {
    setUniqueSelectedTracks(
      selectedTracks.filter(
        (trackUri) =>
          !destinationPlaylistTracks
            .map((track) => track.uri)
            .includes(trackUri)
      )
    );
  }, [selectedTracks, destinationPlaylistTracks]);

  const handleTrackClick = (uri: string) => {
    if (selectedTracks.includes(uri)) {
      setSelectedTracks((state) => state.filter((t) => t !== uri));
    } else {
      setSelectedTracks((state) => [...state, uri]);
    }
  };

  const deleteTracksFromSource = async (
    uris: string[],
    displayToast: boolean = false
  ) => {
    if (!(sourcePlaylist || likedTracksStatus === 'S')) {
      console.error(
        'HOW THE FUCK DID THIS RUN, source playlist is null or undefined'
      );
      return;
    }

    const headers = new Headers({
      Authorization: 'Bearer ' + accessTokenSaved,
      'Content-Type': 'application/json',
    });

    let response;

    // delete form a playlist
    if (sourcePlaylist) {
      const data = {
        uris: uris,
        snapshot_id: sourcePlaylist.snapshot_id,
      };
      console.log(data);

      response = await fetch(
        `https://api.spotify.com/v1/playlists/${sourcePlaylist.id}/tracks`,
        {
          method: 'DELETE',
          headers: headers,
          body: JSON.stringify(data),
        }
      );
      // delete from liked songs
    } else {
      const data = {
        ids: uris.map((uri) => uri.split(':')[2]),
      };

      response = await fetch('https://api.spotify.com/v1/me/tracks', {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify(data),
      });
    }

    if (response.status === 200) {
      const respData = await response.json();
      console.log(respData);

      fetchSourcePlaylistTracks();
      if (displayToast)
        toast({
          title: `${uris.length} song${
            uris.length === 1 ? '' : 's'
          } successfuly deleted.`,
          status: 'success',
          position: 'top',
          isClosable: true,
        });
    } else {
      console.error(response);
    }

    setSelectedTracks([]);
    setUniqueSelectedTracks([]);
  };

  // MODAL CONTROL
  const { isOpen, onOpen: openModal, onClose } = useDisclosure();
  const onDeleteClick = () => {
    if (selectedTracks.length > 0) {
      openModal();
    } else {
      displayErrorToast("You don't have any selected tracks.");
    }
  };

  const onMoveClick = async (deleteSongs: boolean = true) => {
    if (selectedTracks.length === 0) {
      displayErrorToast("You didn't select any songs to transfer.");
      return;
    }

    if (selectedTracks.length >= 0 && uniqueSelectedTracks.length === 0) {
      displayErrorToast(
        `${
          selectedTracks.length === 1
            ? 'The selected song is'
            : 'Selected songs are'
        } already in the destination playlist.`
      );
      return;
    }

    const headers = new Headers({
      Authorization: 'Bearer ' + accessTokenSaved,
      'Content-Type': 'application/json',
    });

    let response;

    // chech if destination is not users liked songs, if yes use different endpoint
    // to save to users liked songs
    if (destinationPlaylist !== undefined) {
      const data = {
        uris: uniqueSelectedTracks,
        position: 0,
      };
      response = await fetch(
        `https://api.spotify.com/v1/playlists/${destinationPlaylist.id}/tracks`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data),
        }
      );
    } else {
      const data = {
        ids: uniqueSelectedTracks.map((uri) => uri.split(':')[2]),
      };
      // if dest is my liked songs
      response = await fetch(`https://api.spotify.com/v1/me/tracks`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data),
      });
    }

    if (response.status === 200 || response.status === 201) {
      fetchDestinationPlaylistTracks();
      if (deleteSongs) deleteTracksFromSource(uniqueSelectedTracks);
      toast({
        title: `${uniqueSelectedTracks.length} song${
          uniqueSelectedTracks.length === 1 ? '' : 's'
        } moved or copied successfuly.`,
        status: 'success',
        position: 'top',
        isClosable: true,
      });
    } else {
      console.error(response);
    }

    setSelectedTracks([]);
    setUniqueSelectedTracks([]);
  };

  const onCopyClick = async () => {
    onMoveClick(false);
  };

  const DESTINATION_HIGHLIGHT_COLOR = 'orange.500';
  const SOURCE_HIGHLIGHT_COLOR = 'whatsapp.500';

  return (
    <div>
      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => deleteTracksFromSource(selectedTracks, true)}
      />
      <Navbar
        onClick={() => logout(navigate)}
        buttonText='Logout'
        displayName={currentUser?.display_name}
      />
      <Flex justify={'space-between'}>
        {/* ALL USERS PLAYLISTS */}
        <Container
          mx='0'
          px='4'
          pb='10'
          maxWidth='max-content'
          bg='blackAlpha.600'
        >
          <Heading color={'purple.500'} py='7' size='lg'>
            All your playlists
          </Heading>

          <PlaylistItem
            name='Liked Songs'
            selected={likedTracksStatus === 'S'}
            selectedColor={SOURCE_HIGHLIGHT_COLOR}
            onClick={() => {
              if (likedTracksStatus === 'D') {
                setDestinationPlaylist(undefined);
                setDestinationPlaylistTracks([]);
              }
              setLikedTracksStatus('S');
              fetchLikedTracks('S');
              setSourcePlaylist(undefined);
            }}
          />
          {usersPlaylists?.map((playlist) => (
            <PlaylistItem
              selected={playlist.id === sourcePlaylist?.id}
              selectedColor={SOURCE_HIGHLIGHT_COLOR}
              name={playlist.name}
              key={playlist.id}
              onClick={() => {
                if (playlist.id === destinationPlaylist?.id) {
                  setDestinationPlaylist(undefined);
                  setDestinationPlaylistTracks([]);
                }
                setSourcePlaylist(playlist);
                if (likedTracksStatus === 'S') setLikedTracksStatus('N');
              }}
            />
          ))}
        </Container>

        <Box flex='1' mt='4' mx='4'>
          {/* BUTTONS */}
          <Buttons
            mb='4'
            onDeleteClick={onDeleteClick}
            onMoveClick={onMoveClick}
            onCopyClick={onCopyClick}
            deleteDisabled={
              sourcePlaylist?.owner.id !== currentUser?.id &&
              likedTracksStatus !== 'S'
            }
            moveDisabled={
              (sourcePlaylist?.owner.id !== currentUser?.id &&
                likedTracksStatus !== 'S') ||
              !(sourcePlaylist || likedTracksStatus === 'S') ||
              !(destinationPlaylist || likedTracksStatus === 'D')
            }
            copyDisabled={
              !(sourcePlaylist || likedTracksStatus === 'S') ||
              !(destinationPlaylist || likedTracksStatus === 'D')
            }
          />
          <Flex gap={4}>
            {/* ORIGIN PLAYLIST */}
            <Container colorScheme={'whatsapp'} px='0' maxW={'full'}>
              <Heading
                color={SOURCE_HIGHLIGHT_COLOR}
                mb='4'
                size='lg'
                noOfLines={1}
              >
                {sourcePlaylist?.name
                  ? 'Source: ' + sourcePlaylist.name
                  : likedTracksStatus === 'S'
                  ? 'Source: Liked Songs'
                  : 'Select source playlist'}
              </Heading>
              {sourcePlaylistLoading ? (
                <Center>
                  <Spinner />
                </Center>
              ) : (
                <PlaylistTracks
                  handleTrackClick={(uri) => handleTrackClick(uri)}
                  tracksSelectable={true}
                  selectedTracks={selectedTracks}
                  tracks={sourcePlaylistTracks}
                />
              )}
            </Container>

            {/* DESTINATION PLAYLIST */}
            <Container colorScheme={'whatsapp'} px='0' maxW={'full'}>
              <Heading
                color={DESTINATION_HIGHLIGHT_COLOR}
                mb='4'
                size='lg'
                noOfLines={1}
              >
                {destinationPlaylist?.name
                  ? 'Destination: ' + destinationPlaylist.name
                  : likedTracksStatus === 'D'
                  ? 'Destination: Liked Songs'
                  : 'Select destination playlist'}
              </Heading>
              {destinationPlaylistLoading ? (
                <Center>
                  <Spinner size={'xl'} />
                </Center>
              ) : (
                <PlaylistTracks tracks={destinationPlaylistTracks} />
              )}
            </Container>
          </Flex>
        </Box>

        {/* USER OWNED PLAYLISTS */}
        <Container
          mx='0'
          px='4'
          pb='10'
          maxWidth='max-content'
          bg='blackAlpha.600'
        >
          <Heading color={'purple.500'} py='7' size='lg'>
            Owned playlists
          </Heading>

          <PlaylistItem
            name='Liked Songs'
            selected={likedTracksStatus === 'D'}
            selectedColor={DESTINATION_HIGHLIGHT_COLOR}
            onClick={() => {
              if (likedTracksStatus === 'S') {
                setSourcePlaylist(undefined);
                setSourcePlaylistTracks([]);
              }
              setLikedTracksStatus('D');
              setDestinationPlaylist(undefined);
              fetchLikedTracks('D');
            }}
          />
          {usersPlaylists?.map((playlist) => {
            if (playlist.owner.id === currentUser?.id)
              return (
                <PlaylistItem
                  selected={playlist.id === destinationPlaylist?.id}
                  selectedColor={DESTINATION_HIGHLIGHT_COLOR}
                  name={playlist.name}
                  key={playlist.id}
                  onClick={() => {
                    if (playlist.id === sourcePlaylist?.id) {
                      setSourcePlaylist(undefined);
                      setSourcePlaylistTracks([]);
                    }
                    setDestinationPlaylist(playlist);
                    if (likedTracksStatus === 'D') setLikedTracksStatus('N');
                  }}
                />
              );
          })}
        </Container>
      </Flex>
    </div>
  );
}

export default ConnectedPage;
