import classes from "../css/exp.module.scss";
import React from "react";

export default function PageMask(props: {
    text?: string | React.ReactNode | null
    showCursor?: boolean
}) {
    let showCursor = false
    if (props.showCursor) {
        showCursor = true
    }
    return <div className={classes.screen} style={showCursor ? {cursor: 'default'} : {}}>
        {props.text === null || props.text === undefined ? null : (<div className={classes.content}>
                <div className={classes.descriptionText}>{props.text}</div>
            </div>
        )}
    </div>
}