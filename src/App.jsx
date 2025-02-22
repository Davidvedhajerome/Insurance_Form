import React, { useState } from "react";
import FileUpload from './components/FileUpload';

import Button from "./components/ui/button"; // Default export
import { Card, CardContent } from "./components/ui/card"; // Named exports
import Input from "./components/ui/input"; // Default export
import Label from "./components/ui/label"; // Default export
import { motion } from "framer-motion";
import "./styles/family-form.css";

const FamilyForm = () => {
  const [family, setFamily] = useState({
    head: { name: "", dob: "", phone: "", photo: null },
    spouse: { name: "", dob: "", phone: "", photo: null, isNil: false },
    sons: [], // Initialize as an empty array
    daughters: [], // Initialize as an empty array
    father: { name: "", dob: "", phone: "", photo: null, isNil: false },
    mother: { name: "", dob: "", phone: "", photo: null, isNil: false },
    fatherInLaw: { name: "", dob: "", phone: "", photo: null, isNil: false },
    motherInLaw: { name: "", dob: "", phone: "", photo: null, isNil: false },
    address: "",
  });

  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({}); // State to hold uploaded files

  const handlePhoneValidation = (phone) => {
    const phoneRegex = /^[7-9][0-9]{9}$/; // Indian phone number format
    return phoneRegex.test(phone);
  };

  const handleFileValidation = (file) => {
    const validFileTypes = /(\.jpg|\.jpeg|\.png|\.gif|\.bmp|\.webp)$/i; // Allowed image formats
    return validFileTypes.test(file.name);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  const handleChange = (e, relation, index, field) => {
    const value = e.target.value;

    // Phone validation
    if (field === "phone") {
      if (!handlePhoneValidation(value)) {
        setError(`Invalid phone number format. Please enter a valid Indian phone number.`);
        return;
      } else {
        setError("");  // Clear the error when the phone number is valid
      }
    }

    // File validation
    if (field === "photo") {
      const file = e.target.files[0];
      if (file && !handleFileValidation(file)) {
        setError(`Invalid file format. Only image files (jpg, jpeg, png, gif, etc.) are allowed.`);
        return;
      } else {
        setError("");  // Clear the error when the file is valid
      }
    }

    if (relation === "sons" || relation === "daughters") {
      const updatedRelation = [...family[relation]];
      updatedRelation[index][field] = value;
      if (field === "dob") {
        const age = calculateAge(value);
        if (age > 25) {
          setError(`Child at S.No-${index + 1} is not valid. Cannot be above 25 years for Son/Daughter.`);
          return;
        } else {
          setError(""); // Clear error if age is valid
        }
      }
      setFamily({ ...family, [relation]: updatedRelation });
    } else {
      // If the relation is marked as "Nil", treat it as filled
      if (field === "isNil" && value) {
        setFamily((prevFamily) => ({
          ...prevFamily,
          [relation]: { ...prevFamily[relation], isNil: !prevFamily[relation].isNil },
        }));
      } else {
        setFamily({ ...family, [relation]: { ...family[relation], [field]: value } });
      }
    }
  };

  const handleNilChange = (relation, index) => {
    setFamily((prevFamily) => {
      const updatedRelation = Array.isArray(prevFamily[relation])
        ? prevFamily[relation].map((item, i) =>
            i === index ? { ...item, isNil: !item.isNil } : item
          )
        : []; // Return an empty array if it's not an array
      return { ...prevFamily, [relation]: updatedRelation };
    });
  };

  const addMember = (relation) => {
    setFamily({
      ...family,
      [relation]: [...family[relation], { name: "", dob: "", phone: "", photo: null }],
    });
  };

  const removeMember = (relation, index) => {
    setFamily((prevFamily) => {
      const updatedRelation = prevFamily[relation].filter((_, i) => i !== index);
      return { ...prevFamily, [relation]: updatedRelation };
    });
    setError("");
  };

  const handleFileUpload = (fileData) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileData.fileName]: fileData.filePath // Store the uploaded file path
    }));
  };

  const handleSubmit = async () => {
    // Ensure form data is valid
    if (!family.head.name || !family.head.dob || !family.head.phone || !family.address) {
      setError("All required fields must be filled");
      return;
    }

    setIsLocked(true);

    // Include uploaded files in the family data if needed
    const formData = { ...family, uploadedFiles };

    try {
      const response = await fetch("https://9280-36-255-17-207.ngrok-free.app/submit-form", {
        method: "POST", // Make sure it's POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send form data
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
      } else {
        alert("Failed to submit form");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while submitting the form.");
    } finally {
      setIsLocked(false);
    }
  };

  return (
      <motion.div
          initial={{opacity: 0, scale: 0.9}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: 1}}
          className="p-4 flex justify-center items-center h-screen"
      >
        <Card
            className="p-6 shadow-2xl rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white max-w-3xl w-full">
          <CardContent>
            <h2 className="text-2xl font-bold text-center mb-6">Family Insurance Form</h2>

            {/* Head of Family */}
            <div className="mb-4">
              <Label>Head of Family</Label>
              <Input
                  placeholder="Name"
                  onChange={(e) => handleChange(e, "head", null, "name")}
                  disabled={isLocked}
              />
              <Input
                  type="date"
                  placeholder="DOB"
                  onChange={(e) => handleChange(e, "head", null, "dob")}
                  disabled={isLocked}
              />
              <Input
                  placeholder="Phone"
                  onChange={(e) => handleChange(e, "head", null, "phone")}
                  disabled={isLocked}
              />
              <FileUpload onFileUpload={handleFileUpload}/>
            </div>

            {/* Other Relations */}
            {Object.keys(family).map(
                (relation) =>
                    relation !== "address" &&
                    relation !== "sons" &&
                    relation !== "daughters" &&
                    relation !== "head" && (
                        <div key={relation} className="mb-4">
                          <Label>{relation.charAt(0).toUpperCase() + relation.slice(1)}</Label>
                          <Input
                              placeholder="Name"
                              onChange={(e) => handleChange(e, relation, null, "name")}
                              disabled={isLocked || family[relation].isNil}
                          />
                          <Input
                              type="date"
                              placeholder="DOB"
                              onChange={(e) => handleChange(e, relation, null, "dob")}
                              disabled={isLocked || family[relation].isNil}
                          />
                          <Input
                              placeholder="Phone"
                              onChange={(e) => handleChange(e, relation, null, "phone")}
                              disabled={isLocked || family[relation].isNil}
                          />
                          <FileUpload onFileUpload={handleFileUpload}/>
                          <div className="flex justify-center items-center mt-2">
                            <label>
                              <input
                                  type="checkbox"
                                  checked={family[relation].isNil}
                                  onChange={() => handleNilChange(relation)}
                                  disabled={isLocked}
                              />
                              <span className="ml-2">Nil</span>
                            </label>
                          </div>
                        </div>
                    )
            )}

            {/* Sons and Daughters */}
            {[{key: "sons", label: "Sons"}, {key: "daughters", label: "Daughters"}].map(
                ({key, label}) => (
                    <div key={key} className="mb-4">
                      <Label>{label}</Label>
                      {(Array.isArray(family[key]) ? family[key] : []).map((member, index) => (
                          <motion.div
                              key={index}
                              className="mb-2 p-3 rounded-lg bg-white text-black shadow-md"
                              whileHover={{scale: 1.02}}
                          >
                            <Input
                                placeholder={`${label}${index + 1} Name`}
                                onChange={(e) => handleChange(e, key, index, "name")}
                                disabled={isLocked}
                            />
                            <Input
                                type="date"
                                placeholder="DOB"
                                onChange={(e) => handleChange(e, key, index, "dob")}
                                disabled={isLocked}
                            />
                            <Input
                                placeholder="Phone"
                                onChange={(e) => handleChange(e, key, index, "phone")}
                                disabled={isLocked}
                            />
                            <FileUpload onFileUpload={handleFileUpload}/>
                            <div className="flex justify-center items-center mt-2">
                              <label>
                                <input
                                    type="checkbox"
                                    checked={family[key][index]?.isNil || false}
                                    onChange={() => handleNilChange(key, index)}
                                    disabled={isLocked}
                                />
                                <span className="ml-2">Nil</span>
                              </label>
                            </div>
                            <Button
                                className="mt-2 bg-red-500 hover:bg-red-700 text-white"
                                onClick={() => removeMember(key, index)}
                                disabled={isLocked}
                            >
                              Remove
                            </Button>
                          </motion.div>
                      ))}
                      <Button
                          className="mt-2 bg-green-500 hover:bg-green-700 text-white"
                          onClick={() => addMember(key)}
                          disabled={isLocked}
                      >
                        Add {label.slice(0, -1)}
                      </Button>
                    </div>
                )
            )}

            <Label>Address</Label>
            <Input
                name="address"
                onChange={(e) => setFamily({...family, address: e.target.value})}
                disabled={isLocked}
            />
            <p className="text-red-500 text-center mt-2">{error}</p>
            <input
                className="mt-4"
                value="Submit"
                onClick={handleSubmit}
                disabled={isLocked || error}
            />
          </CardContent>
        </Card>
      </motion.div>

  );

};

export default FamilyForm;