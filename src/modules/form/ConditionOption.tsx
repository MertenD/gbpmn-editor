import React from "react"
import {Comparisons} from "../../model/Comparisons";
import SelectWithCustomInputOption from "./SelectWithCustomInputOption";

export interface ConditionOptionsProps {
    variables: string[]
    value1: string
    onValue1Changed: (newVariable: string) => void
    selectedComparison: Comparisons
    onComparisonChanged: (newComparison: Comparisons) => void
    value2: string
    onValue2Changed: (newValueToCompare: string) => void
    conditionOptionsSpanStyle?: any
}

export default function ConditionOption(props: ConditionOptionsProps) {

    return (
        <span style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            ...props.conditionOptionsSpanStyle
        }}>
            <SelectWithCustomInputOption
                values={props.variables}
                selectedValue={props.value1}
                onValueChanged={props.onValue1Changed}
            />
            <select
                style={{
                    width: 50
                }}
                defaultValue={props.selectedComparison}
                name="comparison"
                id="comparison"
                className="nodrag"
                onChange={(event) => {
                    props.onComparisonChanged(event.target.value as Comparisons)
                }}
            >
                {
                    Object.values(Comparisons).map(comparison => {
                        return <option key={comparison.valueOf()} value={comparison}>{ comparison.valueOf() }</option>
                    })
                }
            </select>
            <SelectWithCustomInputOption
                values={props.variables}
                selectedValue={props.value2}
                onValueChanged={props.onValue2Changed}
            />
        </span>
    )
}