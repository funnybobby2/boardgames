import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './VideoPlayer.module.css';

type VideoPlayerProps = {
    url: string | undefined;
    close: () => void;
}

function VideoPlayer({ url, close }: VideoPlayerProps) {

  if (!url) return null;

  return (
    <>
      <button type="button" className={`unstyled-button ${styles.closeVideo}`} onClick={close} aria-label="Fermer la vidéo" autoFocus>
        <FontAwesomeIcon icon={faXmark} />
      </button>
      <iframe
        id="youtubeVideo"
        width="100%"
        height="100%"
        src={url}
        title="Vidéo des règles"
        allow="autoplay; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    </>
  );
}

export default VideoPlayer;
