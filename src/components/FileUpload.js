import React, { useState } from 'react';
import Message from './Message';
import axios from 'axios';

const FileUpload = ({ onFileUpload }) => {
  const [message, setMessage] = useState('');
   const ngrokURL = 'https://9280-36-255-17-207.ngrok-free.app';
  const onChange = async (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${ngrokURL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { fileName, filePath } = res.data;
      onFileUpload({ fileName, filePath });
      setMessage('File uploaded successfully');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.msg || 'An error occurred during upload');
    }
  };

  return (
    <div>
      {message && <Message msg={message} />}
      <div className="custom-file mb-4">
        <input type="file" className="custom-file-input" onChange={onChange} />
        <label className="custom-file-label">Choose File</label>
      </div>
    </div>
  );
};

export default FileUpload;
