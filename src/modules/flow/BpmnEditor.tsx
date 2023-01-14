import ReactFlow, {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap, OnConnectStartParams,
    Panel,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import shallow from 'zustand/shallow';
import useStore, {edgeStyle} from '../../store';
import React, {useCallback, useRef} from "react";
import NodesToolbar from "./toolbars/NodesToolbar";
import ControlsToolbar from "./toolbars/ControlsToolbar";
import { v4 as uuidv4 } from 'uuid';
import OnCanvasNodesToolbar from "./toolbars/OnCanvasNodesSelector";

const selector = (state: any) => ({
    getNextNodeId: state.getNextNodeId,
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    nodeTypes: state.nodeTypes
});

function DragAndDropFlow() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes } = useStore(selector, shallow);

    const connectStartParams = useRef<OnConnectStartParams | null>(null);
    const reactFlowWrapper = useRef(null);
    const reactFlowInstance = useReactFlow();

    const [openOnCanvasNodeSelector, setOpenOnCanvasNodeSelector] = React.useState(false);
    const [lastEventPosition, setLastEventPosition] = React.useState<{x: number, y: number}>({x: 0, y: 0})

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: any) => {
        event.preventDefault();

        // @ts-ignore
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const { nodeType, nodeData } = JSON.parse(event.dataTransfer.getData('application/reactflow'));

        // check if the dropped element is valid
        if (typeof nodeType === 'undefined' || !nodeType) {
            return;
        }

        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        addNodeAtPosition(position, nodeType, nodeData)
    }, [reactFlowInstance]);

    const onConnectStart = useCallback((event: any, node: OnConnectStartParams) => {
        connectStartParams.current = node;
    }, []);

    const onConnectEnd = useCallback(
        (event: any) => {
            const targetIsPane = event.target.classList.contains('react-flow__pane');

            if (targetIsPane && reactFlowWrapper.current !== null) {
                // @ts-ignore
                const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
                setLastEventPosition(reactFlowInstance.project({ x: event.clientX - left, y: event.clientY - top }))
                setOpenOnCanvasNodeSelector(true)
            }
        },
        [reactFlowInstance.project]
    );

    function addNodeAtPosition(position: {x: number, y:number}, nodeType: string, data: any = {}): string {
        let yOffset = 0
        switch(nodeType) {
            case "endNode":
                yOffset = 21
                break
            case "activityNode":
                yOffset = 121
                break
            case "decisionNode":
                yOffset = 18
                break
        }

        const id = uuidv4();
        const newNode = {
            id,
            type: nodeType,
            position: { ...position, y: position.y - yOffset },
            data: data,
        };

        // @ts-ignore
        reactFlowInstance.setNodes((nds) => nds.concat(newNode));

        return id
    }

    return (
        <ReactFlow ref={reactFlowWrapper}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
                type: "step"
            }}
            deleteKeyCode={["Backspace", "Delete"]}
        >
            <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
            />
            <Controls />
            <Background variant={BackgroundVariant.Dots} />
            <Panel position="top-left">
                <NodesToolbar />
            </Panel>
            <Panel position="top-right">
                <ControlsToolbar />
            </Panel>
            <OnCanvasNodesToolbar
                open={openOnCanvasNodeSelector}
                onClose={(nodeType: string | null) => {
                    setOpenOnCanvasNodeSelector(false)

                    if (nodeType !== null) {
                        const id = addNodeAtPosition(lastEventPosition, nodeType)
                        // @ts-ignore
                        reactFlowInstance.setEdges((eds) => eds.concat({
                            id,
                            source: connectStartParams.current?.nodeId,
                            sourceHandle: connectStartParams.current?.handleId,
                            target: id,
                            ...edgeStyle
                        }));
                    }
                }}
            />
        </ReactFlow>
    );
}

export default function BpmnEditor() {
    return (
        <ReactFlowProvider>
            <DragAndDropFlow />
        </ReactFlowProvider>
    )
}