import React, {useEffect, useState} from "react"
import {BadgeType} from "../../model/BadgeType";
import {PointsType} from "../../model/PointsType";
import useStore from "../../store";
import OptionalConditionOption from "../form/OptionalConditionOption";
import DropdownOption from "../form/DropdownOption";

enum Comparisons {
    EQUALS = "=",
    NOT_EQUALS = "!=",
    GREATER = ">",
    GREATER_OR_EQUALS = ">=",
    LOWER = "<",
    LOWER_OR_EQUALS = "<="
}

export type BadgeGamificationOptionsData = {
    badgeType?: BadgeType,
    hasCondition?: boolean
    variableName?: string,
    comparison?: Comparisons,
    valueToCompare?: string
}

interface BadgeGamificationOptionsProps {
    nodeId: string,
    parentVariableName: string,
    gamificationOptions: BadgeGamificationOptionsData
    onChange: (gamificationOptions: BadgeGamificationOptionsData) => void
}

export default function BadgeGamificationOptions(props: BadgeGamificationOptionsProps) {

    const nodes = useStore((state) => state.nodes)
    const edges = useStore((state) => state.edges)
    const getAvailableVariableNames = useStore((state) => state.getAvailableVariableNames)
    const [availableVariableNames, setAvailableVariableNames] = useState<string[]>([])
    const [badgeType, setBadgeType] = useState(props.gamificationOptions.badgeType || BadgeType.EXPLORER_BATCH)
    const [hasCondition, setHasCondition] = useState<boolean>(props.gamificationOptions.hasCondition || false)
    const [selectedVariable, setSelectedVariable] = useState(props.gamificationOptions.variableName || PointsType.EXPERIENCE.valueOf());
    const [comparison, setComparison] = useState(props.gamificationOptions.comparison || Comparisons.EQUALS);
    const [valueToCompare, setValueToCompare] = useState(props.gamificationOptions.valueToCompare || "");

    useEffect(() => {
        setAvailableVariableNames(getAvailableVariableNames(props.nodeId, props.parentVariableName))
    }, [props.nodeId, props.parentVariableName, nodes, edges])

    useEffect(() => {
        props.onChange({
            badgeType: badgeType,
            hasCondition: hasCondition,
            variableName: selectedVariable,
            comparison: comparison,
            valueToCompare: valueToCompare
        })
    }, [badgeType, hasCondition, selectedVariable, comparison, valueToCompare])

    return (
        <>
            <DropdownOption
                title={ "Badge type" }
                values={ Object.values(BadgeType) }
                selectedValue={ badgeType }
                onValueChanged={ newValue => setBadgeType(newValue as BadgeType) }
            />
            <OptionalConditionOption
                hasCondition={hasCondition}
                setHasCondition={ newValue => setHasCondition(newValue) }
                variables={availableVariableNames}
                selectedVariable={selectedVariable}
                onVariableChanged={ newVariable => setSelectedVariable(newVariable) }
                selectedComparison={ comparison }
                onComparisonChanges={ newComparison => setComparison(newComparison) }
                valueToCompare={ valueToCompare }
                onValueToCompareChanged={ newValueToCompare => setValueToCompare(newValueToCompare) }
            />
        </>
    )
}