import classes from "../css/exp.module.scss";
import React from "react";

export default function PageMask(props: {
    text?: string | React.ReactNode | null
}) {
    return <div className={classes.screen}>
        {props.text === null ? null : (<div className={classes.content}>
                <div className={classes.descriptionText}>
                    {props.text === undefined ? '已完成' : props.text}
                </div>
            </div>
        )}
    </div>
}