import React, {useEffect, useMemo} from "react";
import {API, page_data} from "../const";
import axios from "axios";
import Trial, {TrialData} from "./Trial";


export default function Experiment() {
    const trial_api = useMemo(() => `${API.base_url}${page_data['api_trial']}`, [])
    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([{
        reaction_type: '0'
    }]);

    const [currentIndex, setCurrentIndex] = React.useState(0);

    useEffect(() => {
        axios.get(trial_api).then(response => {
            const data = response.data.data
            setTrialDataList(data.trials);
            setCurrentIndex(data.last_trial_index);
        })
    }, [trial_api]);

    return (<Trial trial={trialDataList[currentIndex]} done={() => {
        setCurrentIndex(i => i + 1)
    }}/>)
}
