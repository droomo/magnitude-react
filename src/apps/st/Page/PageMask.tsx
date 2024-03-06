import classes from "../css/timeCounter.module.scss";
import React from "react";

export default function PageMask(props: {
    text?: string | null
}) {
    return <div className={classes.screen}>
        {props.text === null ? null : (
            props.text === undefined ?
                <div className={classes.descriptionText}>已完成</div> :
                <div className={classes.descriptionText}>{props.text}</div>
        )}
    </div>
}