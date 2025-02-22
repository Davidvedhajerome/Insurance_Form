import React, { useState } from 'react';
import Message from './Message';
import axios from 'axios';

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const ngrokURL = 'https://9280-36-255-17-207.ngrok-free.app'; // Replace with your actual ngrok URL

  const onChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

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
      setMessage(err.response ? err.response.data.msg : 'An error occurred during the upload');
    }
  };

  return (
    <div>
      {message && <Message msg={message} />}
      <form onSubmit={onSubmit}>
        <div className="custom-file mb-4">
          <input type="file" className="custom-file-input" onChange={onChange} />
        </div>
        <input type="submit" value="Upload" className="btn btn-primary btn-block mt-4" />
      </form>
    </div>
  );
};

export default FileUpload;
