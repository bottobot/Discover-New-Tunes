import React from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.scss' //CSS

export default function MadeBy(props) {
	const { resultsPage } = props;
	let madeByClasses = styles.madeBY;
	if (resultsPage) {
		madeByClasses = [styles.madeBY, styles.madeByArtists].join(" ");
	}
	return (
		<a className={ madeByClasses } target="_blank" rel="noreferrer" href="https://www.mayerseidman.com">
		    <span className={ styles.text }>MADE BY</span>
		    <Image src="/images/icons/profile.png" className={ styles.profile } alt="Profile" width="30" height="30" />
		</a>
	)
}