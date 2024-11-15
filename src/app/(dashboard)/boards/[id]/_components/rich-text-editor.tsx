'use client';

import { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Props {
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
}
function TextEditor({ description, setDescription }: Props) {
  return (
    <ReactQuill
      theme="snow"
      value={description}
      onChange={(value) => setDescription(value)}
    />
  );
}

export default TextEditor;
