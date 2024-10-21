import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'
import styles from '../styles/Artist.module.scss'

export default function ArtistContainer(props) {
    const { artistNameRef } = props;
    const [editArtist, setEditArtist] = useState(false);
    // const [originalArtist, setOriginalArtist] = useState("value");
    const [originalArtistName, setOriginalArtistName] = useState(props.artistName);
    const [artistName, setArtistName] = useState(props.artistName);

    function openEditArtist() {
        setEditArtist(true);
    }
    // useEffect(() => { setOriginalArtist(artistName); }, [artistName]);
    function handleChange(event) {
        const value = event.target.value;
        console.log("OG:", originalArtistName, "VALUE:", value)
        setArtistName(value);
    }
    function handleSaveArtistClick () {
        const oldName = originalArtistName;
        const newName = artistNameRef.current.value;
        props.handleSaveArtist(oldName, newName);
        setEditArtist(false);
    }

    function deleteArtist(artist) {
        props.handleDeleteArtist(artist);
    }
    function renderArtistField() {
        var artist = artistName;
        if (editArtist) {
            var artistField = (
                <div className={ styles.editContainer }>
                    <input type="text" ref={ artistNameRef } onChange={ handleChange } 
                        value={ artistName } style={{width: `${(artistName.length + 1) * 8}px`}} />
                    <a className={ styles.editLink } onClick={ handleSaveArtistClick }>Save</a>
                </div>
            )
        } else {
            const artistNameClasses = [styles.cell, styles.artistName].join(" ");
            var artistField = <td className={ artistNameClasses }>{ artist}</td>
        }
        return artistField;
    }
    function renderSoundcloudField() {
        var artist = artistName;
        const soundcloudURL = "https://soundcloud.com/search/people?q=" + artist;
        if (editArtist) {
            var className = "hidden";
        }
        const soundcloudCellClasses = [styles.cell, styles.soundcloud, styles.className].join(" ");
        var soundcloudField = (
            <div className={ soundcloudCellClasses }>
                <a className={ styles.artistLink } href={ soundcloudURL } target="_blank" rel="noreferrer">
                    <Image src="/images/icons/soundcloud.png" className={ styles.img } alt="Soundcloud" width="30" height="30" />
                </a>
            </div>
        )
        return soundcloudField;
    }
    function renderSpotifyField() {
        var artist = artistName;
        const spotifyURL = "https://open.spotify.com/search/" + artist;
        if (editArtist) {
            var className = "hidden";
        }
        const spotifyCellClasses = [styles.cell, styles.serviceField, styles.className].join(" ");
        var spotifyField = (
            <div className={ spotifyCellClasses }>
                <a className={ styles.artistLink } href={ spotifyURL } target="_blank" rel="noreferrer">
                    <Image src="/images/icons/spotify.png" className={ styles.img } alt="Spotify" width="35" height="35" />
                </a>
            </div>
        )
        return spotifyField;
    }
    function renderYouTubeField() {
        var artist = artistName;
        const youtubeURL = "https://www.youtube.com/results?search_query=" + artist + "+music+artist";
        if (editArtist) {
            var className = "hidden";
        }
        const youtubeCellClasses = [styles.cell, styles.serviceField, styles.className].join(" ")
        var youtubeField = (
            <div className={ youtubeCellClasses }>
                <a className={styles.artistLink } href={ youtubeURL } target="_blank" rel="noreferrer">
                    <Image src="/images/icons/youtube.png" className={ styles.img } alt="Youtube" width="35" height="35" />
                </a>
            </div>
        )
        return youtubeField;
    }
    function renderActions() {
        var artist = artistName;
        const actionsCellClasses = [styles.cell, styles.editContainer, styles.hideOnMobile].join(" ");
        var editLink = (<a className={ styles.editLink } onClick={ openEditArtist.bind(this, artist) }>EDIT</a>)
        var deleteLink = (<a className={ styles.deleteLink } onClick={ deleteArtist.bind(this, artist) }>DELETE</a>)
        var actionsField = (
            <div className={ actionsCellClasses }>
                { editLink }
                { deleteLink }
            </div>
        )
        return actionsField;
    }
    function renderMobileActions() {
        var artist = artistName;
        var editLink = (<a className={ styles.editLink } onClick={ openEditArtist.bind(this, artist) }>EDIT</a>)
        var deleteLink = (<a className={ styles.deleteLink } onClick={ deleteArtist.bind(this, artist) }>DELETE</a>)
        var mobileActionsField = (
            <div>
                <a className={ styles.options }>...</a>
                <div className={ styles.popoverContent }>
                    <p className={ styles.popoverMessage }>
                        { editLink }
                        { deleteLink }
                    </p>
                </div>
            </div>
        )
        return mobileActionsField;
    }

    function renderArtist() {
        if (editArtist) {
            const soundcloudTDClasses = [styles.td, styles.right, styles.hide].join(" ");
            var soundcloud = (
                <div className={ soundcloudTDClasses }>{ renderSoundcloudField() }</div>
            )
            const spotifyTDClasses = [styles.td, styles.center, styles.hideClass].join(" ");
            var spotify = (
                <div className={ spotifyTDClasses }>{ renderSpotifyField() }</div>
            )
            const youtubeTDClasses = [styles.td, styles.hideClass].join(" ");
            var youtube = (
                <div className={ youtubeTDClasses }>{ renderYouTubeField() }</div>
            )
            const mobileTDClasses = [styles.td, styles.right, styles.mobileActions, styles.edit].join(" ");
            var mobileActions = (
                <div className={ mobileTDClasses }>{ renderMobileActions() }</div>
            )
        } else {
            const soundcloudTDClasses = [styles.td, styles.right].join(" ");
            var soundcloud = (
                <div className={ soundcloudTDClasses }>{ renderSoundcloudField() }</div>
            )
            const spotifyTDClasses = [styles.td, styles.center].join(" ");
            var spotify = (
                <div className={ spotifyTDClasses }>{ renderSpotifyField() }</div>
            )
            const youtubeTDClasses = [styles.td].join(" ");
            var youtube = (
                <div className={ youtubeTDClasses }>{ renderYouTubeField() }</div>
            )
            const mobileTDClasses = [styles.td, styles.right, styles.mobileActions].join(" ");
            var mobileActions = (
                <div className={ mobileTDClasses }>{ renderMobileActions() }</div>
            )
        }
        const actionClasses = [styles.td, styles.right, styles.actions].join(" ");
        const artistFieldClasses = [styles.td, styles.name].join(" ");
        return (
            // turn this into a TR and get rid of divs around the TD...throwing a warning...
            <div className={ styles.row }>
                <div className={ artistFieldClasses }>{ renderArtistField() }</div>
                { soundcloud }
                { spotify }
                { youtube }
                <div className={ actionClasses }>{ renderActions() }</div>
                { mobileActions }
            </div>
        )
    }
    var artistContainer = renderArtist();
    return artistContainer;
}