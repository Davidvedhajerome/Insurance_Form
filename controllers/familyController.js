const Family = require('../models/Family');
const XLSX = require('xlsx');
const fs = require('fs');

const submitFamilyForm = async (req, res) => {
  try {
    const familyData = req.body;
    const familyName = familyData.head.name; // Assuming head.name is the family name

    // Check for duplicate family name in the database
    const existingFamily = await Family.findOne({ "head.name": familyName });
    if (existingFamily) {
      return res.status(400).json({ message: "Family with this name already exists." });
    }

    // Create and save new family data into the database
    const newFamily = new Family(familyData);
    await newFamily.save();

    // Create the Excel file from the saved family data
    const familyForExcel = formatFamilyDataForExcel(familyData);
    const excelFilePath = saveFamilyDataToExcel(familyForExcel);

    // Send response indicating successful submission
    res.status(200).json({
      message: "Family data saved successfully.",
      excelFilePath, // Include the path to the generated Excel file
    });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Failed to save form data." });
  }
};

// Helper function to format the family data for Excel
const formatFamilyDataForExcel = (familyData) => {
  // Flatten the family data for better representation in Excel format
  const formattedData = [];

  formattedData.push([
    "Relation", "Name", "DOB", "Phone", "Photo Path", "Address", "Is Nil"
  ]);

  // Add head details
  formattedData.push([
    "Head", familyData.head.name, familyData.head.dob, familyData.head.phone,
    familyData.head.photo, familyData.address, ""
  ]);

  // Add spouse details
  formattedData.push([
    "Spouse", familyData.spouse.name, familyData.spouse.dob, familyData.spouse.phone,
    familyData.spouse.photo, "", familyData.spouse.isNil ? "Yes" : "No"
  ]);

  // Add sons details
  familyData.sons.forEach((son, index) => {
    formattedData.push([
      `Son ${index + 1}`, son.name, son.dob, son.phone, son.photo, "", son.isNil ? "Yes" : "No"
    ]);
  });

  // Add daughters details
  familyData.daughters.forEach((daughter, index) => {
    formattedData.push([
      `Daughter ${index + 1}`, daughter.name, daughter.dob, daughter.phone,
      daughter.photo, "", daughter.isNil ? "Yes" : "No"
    ]);
  });

  // Add father, mother, fatherInLaw, and motherInLaw details
  formattedData.push([
    "Father", familyData.father.name, familyData.father.dob, familyData.father.phone,
    familyData.father.photo, "", familyData.father.isNil ? "Yes" : "No"
  ]);
  formattedData.push([
    "Mother", familyData.mother.name, familyData.mother.dob, familyData.mother.phone,
    familyData.mother.photo, "", familyData.mother.isNil ? "Yes" : "No"
  ]);
  formattedData.push([
    "Father-in-law", familyData.fatherInLaw.name, familyData.fatherInLaw.dob,
    familyData.fatherInLaw.phone, familyData.fatherInLaw.photo, "",
    familyData.fatherInLaw.isNil ? "Yes" : "No"
  ]);
  formattedData.push([
    "Mother-in-law", familyData.motherInLaw.name, familyData.motherInLaw.dob,
    familyData.motherInLaw.phone, familyData.motherInLaw.photo, "",
    familyData.motherInLaw.isNil ? "Yes" : "No"
  ]);

  return formattedData;
};

// Helper function to save formatted data to an Excel file
const saveFamilyDataToExcel = (formattedData) => {
  const ws = XLSX.utils.aoa_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Family Data");

  const filePath = `./exports/family_data_${Date.now()}.xlsx`; // Save with a timestamp for uniqueness
  XLSX.writeFile(wb, filePath);

  return filePath;
};

module.exports = { submitFamilyForm };
