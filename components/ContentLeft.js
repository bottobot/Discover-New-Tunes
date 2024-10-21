import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.scss';

export default function ContentLeft(props) {
	const fileInputRef = useRef(null);

	useEffect(() => {
		console.log('ContentLeft component mounted');
	}, []);

	function submitPhoto() {
		console.log('submitPhoto function called');
		if (fileInputRef.current && fileInputRef.current.files[0]) {
			console.log('File selected:', fileInputRef.current.files[0].name);
			props.submitPhoto(fileInputRef.current.files[0]);
		} else {
			console.log('No file selected');
		}
	}

	function handleClick() {
		console.log('Upload button clicked');
	    fileInputRef.current.click();
	}

	var header = <h1 className={ styles.header }>Discover new artists by uploading an image!</h1>
	var text =  <p className={ styles.tagline }>Turn an event or festival lineup into new music by uploading the lineup image.</p>
	var button = <button className={ styles.uploadBTN } onClick={ handleClick }>UPLOAD LINEUP</button>
	var inputField = (
	    <input 
			id="dot" 
			type="file" 
			name="myImage" 
			accept="image/*" 
			className={ styles.hide }
	        ref={ fileInputRef } 
			onChange={ submitPhoto } 
		/>
	)
	var examplePoster = (
		<div className={styles.examplePoster}>
			<p>Example lineup poster:</p>
			<Image src="/images/lineups/elements.png" alt="Example Lineup Poster" width={300} height={450} />
		</div>
	)

	if (props.error) {
	    var classNames = [styles.requirementsText, styles.error].join(" ");
	} else {
	    var classNames = [styles.requirementsText].join(" ");
	}
	var requirementsText = <p className={ classNames }>Must be an image and smaller than 1MB</p>

	console.log('Rendering ContentLeft component');

	return (
	    <div className={ styles.content } id={ styles.textContainer }>
	        { header }
	        { text }
	        { button }
	        { inputField }
	        { requirementsText }
	        { examplePoster }
	    </div>
	)
}
