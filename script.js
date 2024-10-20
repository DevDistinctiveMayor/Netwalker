function toggleMenu() {
  const navMenu = document.getElementById("navMenu");
  const handburgger = document.querySelector(".handburgger");

  navMenu.classList.toggle("show");

  handburgger.classList.toggle("active");

  if (navMenu.classList.contains("show")) {
    document.body.classList.add("no-scroll");
  } else {
    document.body.classList.remove("no-scroll");
  }
}

function renderMedicineData(
  data,
  medicineListId,
  searchInputClass,
  textareaClass,
  closeBtnClass,
  selectionHandler = null,
  isSecondApi = false,
  nextInputClass = null // Next input field to focus on
) {
  let medicineListDiv = document.getElementById(medicineListId);

  // Clear any previous content
  medicineListDiv.innerHTML = "";

  // Check if it's the second API (with different data structure)
  data.forEach((medicine) => {
    let medicineItemHTML = "";

    // Render based on the structure of the response
    if (isSecondApi) {
      // Second Use `medicine.medicine_name`
      medicineItemHTML = `
        <div class="medicine-item" data-id="${medicine.id}">
          <p>${medicine.medicine_name}</p>
      `;

      // Check if the "strength" field exists (for the third API)
      if (medicine.strength) {
        medicineItemHTML += `<p><em> strength: ${medicine.strength}</em></p>`;
      }

      medicineItemHTML += `</div>`;
    } else {
      // First API: Use `medicine.name`
      medicineItemHTML = `
        <div class="medicine-item" data-id="${medicine.id}">
          <p>${medicine.name}</p>
        </div>
      `;
    }

    // Append each medicine item to the div
    medicineListDiv.innerHTML += medicineItemHTML;
  });

  // Show the medicine list
  document.querySelector(`.${textareaClass}`).classList.add("show");

  // Add event listener to each medicine item to update the input when clicked
  document
    .querySelectorAll(`#${medicineListId} .medicine-item`)
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        let selectedMedicineName = e.target.textContent; // Get the text of the clicked medicine
        let selectedMedicineId = e.target.closest(".medicine-item").dataset.id; // Get the data-id attribute for the medicine id

        document.querySelector(`.${searchInputClass}`).value =
          selectedMedicineName; // Set the input value to the medicine name

        // If a selection handler is provided (e.g., for storing the ID), call it
        if (selectionHandler) {
          selectionHandler({
            id: selectedMedicineId,
            name: selectedMedicineName,
          });
        }

        // Optionally close the medicine list after selection
        closeMedicineList(textareaClass);

        // Focus on the next input if provided
        if (nextInputClass) {
          document.querySelector(`.${nextInputClass}`).focus();
        }
      });
    });
}

// Fetch data for the first API
async function fetchMedicineData() {
  try {
    // Show loading spinner before making the API request
    document.getElementById("loading").style.display = "block";

    // Fetch data from the API
    let response = await fetch(
      "https://cliniqueplushealthcare.com.ng/prescriptions/drug_class"
    );
    let data = await response.json();

    // Hide loading spinner after the response
    document.getElementById("loading").style.display = "none";

    // Render the fetched data
    renderMedicineData(
      data,
      "medicine-list-1",
      "search_medicinebrand_1",
      "textarea_1",
      "close_textarea_1",
      handleFirstSelection,
      false,
      "search_medicinebrand_2" // Focus on the second input after the first is filled
    );
  } catch (error) {
    // Hide the spinner even if there's an error
    document.getElementById("loading").style.display = "none";
    console.error("Error fetching the medicine data: ", error);
  }
}

// Fetch data for the second API (based on selected medicine ID)
async function fetchIntervalData(selectedMedicineId) {
  try {
    // Show loading spinner before making the API request
    document.getElementById("loading2").style.display = "block";

    let response = await fetch(
      `https://cliniqueplushealthcare.com.ng/prescriptions/get_drug_class_by_id/${selectedMedicineId}`
    );
    let data = await response.json();

    // Hide loading spinner after the response
    document.getElementById("loading2").style.display = "none";

    // Render data for the second input
    renderMedicineData(
      data,
      "medicine-list-2",
      "search_medicinebrand_2",
      "textarea_2",
      "close_textarea_2",
      null,
      true,
      "search_medicinebrand_3" // Focus on the first duration input after the second is filled
    );
  } catch (error) {
    document.getElementById("loading2").style.display = "none";
    console.error("Error fetching the interval data: ", error);
  }
}

// Fetch data for the third API (all medicines)
async function fetchAllMedicineData() {
  try {
    // Show loading spinner before making the API request
    document.getElementById("loading3").style.display = "block";

    let response = await fetch(
      `https://cliniqueplushealthcare.com.ng/prescriptions/all_medicine`
    );
    let data = await response.json();

    // Hide loading spinner after the response
    document.getElementById("loading3").style.display = "none";

    // Render data for the third input, including instruction
    renderMedicineData(
      data,
      "medicine-list-3",
      "search_medicinebrand_3",
      "textarea_3",
      "close_textarea_3",
      null,
      true,
      "dividerinput" // next input to focus after the third input
    );
  } catch (error) {
    document.getElementById("loading3").style.display = "none";
    console.error("Error fetching the medicine data: ", error);
  }
}

// Handle the selection of the first medicine
function handleFirstSelection(medicine) {
  // Store the selected medicine ID
  let selectedMedicineId = medicine.id;

  // Enable the second input for interval selection
  document.querySelector(".search_medicinebrand_2").disabled = false;
  document.querySelector(".search_medicinebrand_2").value = ""; // Clear any previous input in the second field
  document.getElementById("medicine-list-2").innerHTML = ""; // Clear any previous interval data

  // Fetch interval data for the selected medicine (using the second API)
  fetchIntervalData(selectedMedicineId);
}

// Event listeners
document
  .querySelector(".search_medicinebrand_1")
  .addEventListener("click", fetchMedicineData); // Fetch and display medicine data when the first input is clicked

document
  .querySelector(".search_medicinebrand_3")
  .addEventListener("click", fetchAllMedicineData); // Fetch and display all medicines data when the third input is clicked

document
  .querySelector(".close_textarea_1")
  .addEventListener("click", () => closeMedicineList("textarea_1")); // Hide the medicine list for the first input
document
  .querySelector(".close_textarea_2")
  .addEventListener("click", () => closeMedicineList("textarea_2")); // Hide the medicine list for the second input
document
  .querySelector(".close_textarea_3")
  .addEventListener("click", () => closeMedicineList("textarea_3")); // Hide the medicine list for the third input

// Function to hide the medicine list
function closeMedicineList(textareaClass) {
  document.querySelector(`.${textareaClass}`).classList.remove("show");
}

// Function to check if all input fields are filled
function checkAndAppendToTable() {
  const medicineClassInput = document.querySelector(
    ".search_medicinebrand_1"
  ).value;
  const medicineNameInput = document.querySelector(
    ".search_medicinebrand_2"
  ).value;
  const allMedicineInput = document.querySelector(
    ".search_medicinebrand_3"
  ).value;
  const durationInput1 = document.querySelector(
    ".split-input-container input:nth-child(1)"
  ).value;
  const durationInput2 = document.querySelector(
    ".split-input-container input:nth-child(3)"
  ).value;
  const interval = document.querySelector(".interval").value;

  // Check if all inputs are filled
  if (
    medicineClassInput &&
    medicineNameInput &&
    allMedicineInput &&
    durationInput1 &&
    durationInput2 &&
    interval
  ) {
    // Append new row to the table
    appendRowToTable(
      medicineClassInput,
      medicineNameInput,
      allMedicineInput,
      durationInput1,
      durationInput2,
      interval
    );
  } else {
    alert("Please fill all fields before adding to the table.");
  }
}

// Function to append a row to the table
function appendRowToTable(
  medicineClass,
  medicineName,
  allMedicine,
  duration1,
  duration2,
  Interval
) {
  const tableBody = document.querySelector("table tbody");
  const rowCount = tableBody.rows.length + 1;

  const newRow = `
    <tr>
      <td>${rowCount}</td>
      <td>${medicineClass}</td>
      <td>${medicineName}</td>
      <td>${allMedicine}</td>
      <td>${duration1} / ${duration2}</td>
      <td>${Interval}</td>
      <td><button class="remove-button">Remove</button></td>
    </tr>
  `;

  tableBody.insertAdjacentHTML("beforeend", newRow);

  // Add remove button functionality
  addRemoveButtonListeners();
}

// Function to add event listeners to the remove buttons
function addRemoveButtonListeners() {
  const removeButtons = document.querySelectorAll(".remove-button");

  removeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.target.closest("tr").remove();
    });
  });
}

// Event listener for the "Add" button
document
  .querySelector(".add-to-table-btn")
  .addEventListener("click", checkAndAppendToTable);

// Call this once initially to make sure existing rows have remove functionality
addRemoveButtonListeners();
