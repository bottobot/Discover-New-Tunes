import React from 'react';
import Image from 'next/image'
import styles from '../styles/Home.module.scss' //CSS

export default function ContentRight(props) {
    var classNames = [styles.btn, styles.primary].join(" ");
    return (
        <div className={ styles.content } id={ styles.buttonsContainer }>
            <p className={ styles.guideText }>Select a lineup to see  how it works</p>
            <button className={ classNames } lineup="one" onClick={ props.selectLineup }>
                <span><Image src="/images/lineups/elements.png" className={ styles.img } alt="Elements" width="100" height="100"/></span>
                <div className={ styles.lineupText }>
                    <h3>ELEMENTS FESTIVAL</h3>
                    <p>UNITED STATES</p>
                </div>
            </button>
            <button className={ classNames } lineup="two" onClick={ props.selectLineup }>
                <Image src="/images/lineups/day-zero.png" className={ styles.img } alt="Day Zero" width="100" height="100" />
                <div className={ styles.lineupText }>
                    <h3>DAY ZERO</h3>
                    <p>MEXICO</p>
                </div>
            </button>
            <button className={ classNames } lineup="four" onClick={ props.selectLineup }>
                <Image src="/images/lineups/defected.jpeg" className={ styles.img } alt="What" width="100" height="100" />
                <div className={ styles.lineupText }>
                    <h3>DEFECTED</h3>
                    <p>CROATIA</p>
                </div>
            </button>
        </div>
    )
}
