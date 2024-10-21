import _, { map } from 'underscore';
import Image from 'next/image'
import checkImage from '../public/images/icons/check.png';
import styles from '../styles/Notifications.module.scss' //CSS

export default function Notification(props) {
	const { hideNotification } = props;
	const { deleteText } = props;
	const { saveText } = props;
	let texts;
	let notificationStatus;
	let notificationText;
	let notificationClass;

	if (props.saveArtist) {
		notificationStatus = (
			<p className={ styles.status }>Artist Edited 👍!</p>
		)
		notificationText = (
			<p className={ styles.text }>{ props.saveText }</p>
		)
		if (props.hideNotification) {
			var classNames = [styles.notificationContainer, styles.delete, styles.hideNotification].join(" ");
		} else {
			var classNames = [styles.notificationContainer, styles.delete].join(" ");			
		}
	} else if (props.deleteArtist) {
		notificationStatus = (
			<p className={ styles.status }>Artist Deleted 👋!</p>
		)
		notificationText = (
			<p className="text">{ props.deleteText }</p>
		)
		if (props.hideNotification) {
			var classNames = [styles.notificationContainer, styles.delete, styles.hideNotification].join(" ");
		} else {
			var classNames = [styles.notificationContainer, styles.delete].join(" ");			
		}
	} 
	if (props.saveArtist || props.deleteArtist) {
		var notification = (
			<div className={ classNames }>
				<span className={ styles.line }></span>
				<Image src="/images/icons/check.png" className={ styles.check } alt="Check" width="35" height="35" />
				<div className={ styles.notificationText }>
					{ notificationStatus }
					{ notificationText }
				</div>
			</div>
		)
	}
	return notification;
}