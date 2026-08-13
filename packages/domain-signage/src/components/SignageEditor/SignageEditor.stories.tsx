import React from "react";
import { SignageEditorView } from "./SignageEditor.view";

export default {
  title: "SignageEditorView",
  component: SignageEditorView,
};

export const Default = () => (
  <SignageEditorView
    layout={{}}
    setLayout={() => {}}
    selectedNodeId={null}
    setSelectedNodeId={() => {}}
  />
);
