import TrackCard from './TrackCard';

interface Props {
  tracks: SpotifyApi.TrackObjectFull[];
  tracksSelectable?: boolean;
  handleTrackClick?: (uri: string) => void;
  selectedTracks?: string[];
}

const PlaylistTracks = ({
  tracks,
  tracksSelectable,
  handleTrackClick,
  selectedTracks,
}: Props) => {
  return (
    <div>
      {tracks?.map((track, i) => (
        <TrackCard
          selected={selectedTracks?.includes(track.uri)}
          selectable={tracksSelectable}
          track={track}
          key={i}
          onClick={() =>
            handleTrackClick ? handleTrackClick(track.uri) : null
          }
        />
      ))}
    </div>
  );
};

export default PlaylistTracks;
