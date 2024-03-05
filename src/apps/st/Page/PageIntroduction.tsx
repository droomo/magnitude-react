import classes from "../css/timeCounter.module.scss";
import React from "react";

export default function PageIntroduction(props: {
    name: string
}) {
    return <div className={classes.screen}>
        <div className={classes.descriptionText}>请估计{props.name}</div>
    </div>
}