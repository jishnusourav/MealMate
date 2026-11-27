// MEALMATE - WEEKLY MEAL PLANNER
// This array stores all seven days and their three meal slots.

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealTypes = ["Breakfast", "Lunch", "Dinner"];

const mealPlan = {
    Monday: { Breakfast: null, Lunch: null, Dinner: null },
    Tuesday: { Breakfast: null, Lunch: null, Dinner: null },
    Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
    Thursday: { Breakfast: null, Lunch: null, Dinner: null },
    Friday: { Breakfast: null, Lunch: null, Dinner: null },
    Saturday: { Breakfast: null, Lunch: null, Dinner: null },
    Sunday: { Breakfast: null, Lunch: null, Dinner: null }
};

// A few sample meals make the first screen feel useful.
// You can remove these examples if you want an empty planner.
mealPlan.Monday.Breakfast = { name: "Masala dosa", description: "With coconut chutney" };
mealPlan.Monday.Lunch = { name: "Vegetable pulao", description: "With cucumber raita" };
mealPlan.Tuesday.Breakfast = { name: "Fruit and yogurt bowl", description: "A light start to the day" };
mealPlan.Wednesday.Dinner = { name: "Paneer curry", description: "With whole wheat roti" };
mealPlan.Friday.Lunch = { name: "Lemon rice", description: "With roasted peanuts" };

let editingSlot = null;

// Get the HTML elements we need to work with.
const mealTableBody = document.getElementById("mealTableBody");
const mealModal = document.getElementById("mealModal");
const mealForm = document.getElementById("mealForm");
const daySelect = document.getElementById("daySelect");
const mealTypeSelect = document.getElementById("mealTypeSelect");
const mealNameInput = document.getElementById("mealNameInput");
const mealDescriptionInput = document.getElementById("mealDescriptionInput");
const modalTitle = document.getElementById("modalTitle");
const saveMealButton = document.getElementById("saveMealButton");
const formMessage = document.getElementById("formMessage");

// Return a short date label for each day in the current week.
function getWeekDates() {
    const today = new Date();
    const monday = new Date(today);
    const dayNumber = today.getDay();
    monday.setDate(today.getDate() - (dayNumber === 0 ? 6 : dayNumber - 1));

    return days.map(function(day, index) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    });
}

// Check whether a day is today's day.
function getTodayName() {
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
}

// Display the weekly plan in the required HTML table.
function displayMealPlan() {
    const weekDates = getWeekDates();
    const todayName = getTodayName();
    mealTableBody.innerHTML = "";

    days.forEach(function(day, index) {
        const row = document.createElement("tr");
        const dayCell = document.createElement("td");

        dayCell.innerHTML = `
            <span class="day-name">${day}${day === todayName ? " · Today" : ""}</span>
            <span class="day-date">${weekDates[index]}</span>
        `;
        row.appendChild(dayCell);

        mealTypes.forEach(function(type) {
            const cell = document.createElement("td");
            const meal = mealPlan[day][type];

            if (meal) {
                cell.innerHTML = `
                    <div class="meal-slot filled">
                        <strong>${escapeHTML(meal.name)}</strong>
                        <small>${escapeHTML(meal.description || "Planned for this slot")}</small>
                        <div class="slot-actions">
                            <button type="button" data-action="edit" data-day="${day}" data-type="${type}">Edit</button>
                            <button type="button" class="delete-action" data-action="delete" data-day="${day}" data-type="${type}">Remove</button>
                        </div>
                    </div>
                `;
            } else {
                cell.innerHTML = `
                    <button type="button" class="empty-slot" data-action="add" data-day="${day}" data-type="${type}">
                        + Add meal
                    </button>
                `;
            }
            row.appendChild(cell);
        });

        mealTableBody.appendChild(row);
    });

    updateProgress();
    displayOverview();
    displayMyMeals();
}

// Keep user-entered text safe when inserting it into HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        const replacements = {
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#039;"
        };
        return replacements[character];
    });
}

// Count the filled slots and update the dashboard.
function updateProgress() {
    let total = 0;
    const counts = { Breakfast: 0, Lunch: 0, Dinner: 0 };

    days.forEach(function(day) {
        mealTypes.forEach(function(type) {
            if (mealPlan[day][type] !== null) {
                total++;
                counts[type]++;
            }
        });
    });

    const percentage = Math.round((total / 21) * 100);
    document.getElementById("plannedCount").innerHTML = `${total}<span> / 21</span>`;
    document.getElementById("breakfastCount").textContent = counts.Breakfast;
    document.getElementById("lunchCount").textContent = counts.Lunch;
    document.getElementById("dinnerCount").textContent = counts.Dinner;
    document.getElementById("progressFill").style.width = percentage + "%";
    document.getElementById("progressText").textContent = percentage + "% of your week planned";
    document.getElementById("remainingCount").textContent = 21 - total;
}

// Show a compact seven-day overview on the dashboard.
function displayOverview() {
    const overviewDays = document.getElementById("overviewDays");
    const todayName = getTodayName();
    overviewDays.innerHTML = "";

    days.forEach(function(day) {
        const filled = mealTypes.filter(function(type) {
            return mealPlan[day][type] !== null;
        }).length;

        const card = document.createElement("div");
        card.className = "overview-day" + (day === todayName ? " today" : "");
        card.innerHTML = `
            <strong>${day.slice(0, 3)}</strong>
            <small>${filled} of 3 meals</small>
            <div class="day-dots">
                ${mealTypes.map(function(type) {
                    return `<i class="${mealPlan[day][type] ? "filled" : ""}"></i>`;
                }).join("")}
            </div>
        `;
        overviewDays.appendChild(card);
    });
}

// Show all planned meals in the My Meals section.
function displayMyMeals() {
    const mealList = document.getElementById("mealList");
    const allMeals = [];

    days.forEach(function(day) {
        mealTypes.forEach(function(type) {
            const meal = mealPlan[day][type];
            if (meal) {
                allMeals.push({ day: day, type: type, meal: meal });
            }
        });
    });

    mealList.innerHTML = "";

    if (allMeals.length === 0) {
        mealList.innerHTML = `
            <div class="no-meals">
                <span>🥣</span>
                <h3>Your meal list is empty</h3>
                <p>Add a meal to start planning your week.</p>
            </div>
        `;
        return;
    }

    allMeals.forEach(function(item) {
        const card = document.createElement("article");
        card.className = "meal-list-card";
        card.innerHTML = `
            <div>
                <div class="meal-list-meta">${item.day.toUpperCase()} · ${item.type.toUpperCase()}</div>
                <h3>${escapeHTML(item.meal.name)}</h3>
                <p>${escapeHTML(item.meal.description || "No description added")}</p>
            </div>
            <div class="meal-list-actions">
                <button type="button" data-action="edit" data-day="${item.day}" data-type="${item.type}">Edit</button>
                <button type="button" data-action="delete" data-day="${item.day}" data-type="${item.type}">Remove</button>
            </div>
        `;
        mealList.appendChild(card);
    });
}

// Show a lightweight confirmation message after a successful action.
let toastTimer;
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { toast.classList.remove("visible"); }, 2600);
}

// Open the form to add a new meal or replace an existing meal.
function openMealForm(day = "", type = "", isEditing = false) {
    editingSlot = isEditing ? { day: day, type: type } : null;
    mealForm.reset();
    formMessage.textContent = "";

    modalTitle.textContent = isEditing ? "Replace a meal" : "Add a meal";
    saveMealButton.textContent = isEditing ? "Save changes" : "Save meal";

    if (day) daySelect.value = day;
    if (type) mealTypeSelect.value = type;

    if (isEditing) {
        const existingMeal = mealPlan[day][type];
        mealNameInput.value = existingMeal.name;
        mealDescriptionInput.value = existingMeal.description || "";
    }

    mealModal.hidden = false;
    mealNameInput.focus();
}

// Close the meal form.
function closeMealForm() {
    mealModal.hidden = true;
    editingSlot = null;
    mealForm.reset();
    formMessage.textContent = "";
}

// Add a new meal or replace the meal in the selected slot.
function saveMeal(event) {
    event.preventDefault();

    const day = daySelect.value;
    const type = mealTypeSelect.value;
    const name = mealNameInput.value.trim();
    const description = mealDescriptionInput.value.trim();

    if (!day || !type || !name) {
        formMessage.textContent = "Please complete the required fields.";
        return;
    }

    const wasEditing = Boolean(editingSlot);

    // If the user changes the day or meal type while editing,
    // remove the old slot before saving the meal in the new slot.
    if (editingSlot) {
        mealPlan[editingSlot.day][editingSlot.type] = null;
    }

    // This assignment adds a meal or replaces the selected slot.
    mealPlan[day][type] = {
        name: name,
        description: description
    };

    closeMealForm();
    displayMealPlan();
    showToast(wasEditing ? "Meal updated successfully" : "Meal added to your plan");
}

// Remove a meal from the selected day and meal type.
function removeMeal(day, type) {
    const meal = mealPlan[day][type];
    if (!meal) return;

    const confirmed = confirm(`Remove "${meal.name}" from ${day} ${type.toLowerCase()}?`);
    if (confirmed) {
        mealPlan[day][type] = null;
        displayMealPlan();
        showToast("Meal removed from your plan");
    }
}

// Handle Edit, Remove and Add actions inside the planner table and meal list.
function handleMealAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const day = button.dataset.day;
    const type = button.dataset.type;

    if (action === "add") openMealForm(day, type, false);
    if (action === "edit") openMealForm(day, type, true);
    if (action === "delete") removeMeal(day, type);
}

// Navigation: show the selected page section and update the active sidebar link.
function navigateToSection(sectionId) {
    const sectionNames = {
        dashboard: "Dashboard",
        planner: "Weekly Planner",
        "my-meals": "My Meals"
    };

    document.querySelectorAll(".page-section").forEach(function(section) {
        section.style.display = section.id === sectionId ? "block" : "none";
    });

    document.querySelectorAll(".nav-link").forEach(function(link) {
        link.classList.toggle("active", link.dataset.section === sectionId);
    });

    document.getElementById("pageName").textContent = sectionNames[sectionId] || "Dashboard";
    document.getElementById("sidebar").classList.remove("open");
    window.location.hash = sectionId;
}

// Connect buttons and form events.
document.getElementById("openAddButton").addEventListener("click", function() {
    openMealForm();
});
document.getElementById("myMealsAddButton").addEventListener("click", function() {
    openMealForm();
});
document.getElementById("closeModalButton").addEventListener("click", closeMealForm);
document.getElementById("cancelButton").addEventListener("click", closeMealForm);
mealForm.addEventListener("submit", saveMeal);
mealTableBody.addEventListener("click", handleMealAction);
document.getElementById("mealList").addEventListener("click", handleMealAction);
document.getElementById("menuToggle").addEventListener("click", function() {
    const sidebar = document.getElementById("sidebar");
    if (window.matchMedia("(max-width: 760px)").matches) {
        sidebar.classList.toggle("open");
    } else {
        document.body.classList.toggle("sidebar-collapsed");
    }
});

document.querySelectorAll(".nav-link").forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        navigateToSection(link.dataset.section);
    });
});

document.querySelectorAll("[data-section-link]").forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        navigateToSection(link.dataset.sectionLink);
    });
});

mealModal.addEventListener("click", function(event) {
    if (event.target === mealModal) closeMealForm();
});
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        if (!mealModal.hidden) closeMealForm();
        document.getElementById("sidebar").classList.remove("open");
    }
});

// Start on the dashboard and render the first version of the planner.
navigateToSection("dashboard");
displayMealPlan();
